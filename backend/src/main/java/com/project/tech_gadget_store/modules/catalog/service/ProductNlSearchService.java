package com.project.tech_gadget_store.modules.catalog.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Schema;
import com.google.genai.types.Type;
import com.project.tech_gadget_store.config.ChatbotProperties;
import com.project.tech_gadget_store.modules.catalog.dto.request.ProductFilterRequestDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.NlSearchResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductPageResponseDto;
import com.project.tech_gadget_store.modules.catalog.entity.Brand;
import com.project.tech_gadget_store.modules.catalog.entity.Category;
import com.project.tech_gadget_store.modules.catalog.repository.BrandRepository;
import com.project.tech_gadget_store.modules.catalog.repository.CategoryRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Dịch câu tìm kiếm tiếng Việt tự nhiên (vd. "điện thoại chụp ảnh đẹp dưới 15 triệu có 5G")
 * thành {@link ProductFilterRequestDto} bằng Gemini structured output, rồi tái sử dụng
 * {@link ProductService#findProductsByFilter} sẵn có để lấy kết quả — không cần hạ tầng
 * tìm kiếm mới.
 */
@Service
public class ProductNlSearchService {

    private static final Logger log = LoggerFactory.getLogger(ProductNlSearchService.class);

    private static final int MAX_QUERY_LENGTH = 200;

    private static final String SYSTEM_PROMPT = """
            Bạn là bộ máy phân tích câu tìm kiếm sản phẩm bằng tiếng Việt tự nhiên cho một cửa
            hàng thiết bị công nghệ. Nhiệm vụ duy nhất: đọc câu tìm kiếm của khách và trả về đúng
            1 đối tượng JSON theo schema đã cho, mô tả các tiêu chí lọc sản phẩm tương ứng.

            Quy tắc:
            - Giá trị tiền (minPrice/maxPrice) tính bằng đơn vị VNĐ (đồng), KHÔNG phải nghìn hay
              triệu. Ví dụ "dưới 15 triệu" => maxPrice = 15000000. "khoảng 20-30 triệu" =>
              minPrice = 20000000, maxPrice = 30000000.
            - brandNames/categoryNames chỉ được chọn từ danh sách hợp lệ đã cho trong schema —
              không tự bịa thêm thương hiệu hay loại sản phẩm khác.
            - Trường "keyword" chỉ dùng cho phần còn lại không khớp field cấu trúc nào (ví dụ tên
              dòng máy cụ thể như "iPhone 15 Pro Max"). Nếu không còn gì thì để trống.
            - Chỉ điền field nào khách thực sự nhắc tới hoặc ngụ ý rõ ràng; để trống (null hoặc
              mảng rỗng) các field không liên quan, không suy đoán quá mức.
            - Không thêm giải thích, không thêm text ngoài JSON.
            """;

    private final ProductService productService;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ChatbotProperties chatbotProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ProductNlSearchService(
            ProductService productService,
            BrandRepository brandRepository,
            CategoryRepository categoryRepository,
            ChatbotProperties chatbotProperties) {
        this.productService = productService;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.chatbotProperties = chatbotProperties;
    }

    public NlSearchResponseDto search(String query) {
        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException("query must not be blank");
        }
        String trimmed = query.strip();
        if (trimmed.length() > MAX_QUERY_LENGTH) {
            trimmed = trimmed.substring(0, MAX_QUERY_LENGTH);
        }

        ProductFilterRequestDto filter = parseQuery(trimmed);
        ProductPageResponseDto results = productService.findProductsByFilter(filter);
        return NlSearchResponseDto.builder().interpretedFilter(filter).results(results).build();
    }

    private ProductFilterRequestDto parseQuery(String query) {
        String apiKey = chatbotProperties.getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return fallbackFilter(query);
        }

        try {
            List<String> brandNames = brandRepository.findAll().stream().map(Brand::getName).toList();
            List<String> categoryNames = categoryRepository.findAll().stream().map(Category::getName).toList();

            Client client = Client.builder().apiKey(apiKey).build();
            GenerateContentConfig config = GenerateContentConfig.builder()
                    .systemInstruction(com.google.genai.types.Content.fromParts(
                            com.google.genai.types.Part.fromText(SYSTEM_PROMPT)))
                    .responseMimeType("application/json")
                    .responseSchema(buildFilterSchema(brandNames, categoryNames))
                    .build();

            GenerateContentResponse response = client.models.generateContent(
                    chatbotProperties.getModel(), query, config);
            String json = response.text();
            if (json == null || json.isBlank()) {
                return fallbackFilter(query);
            }
            return objectMapper.readValue(json, ProductFilterRequestDto.class);
        } catch (Exception e) {
            log.warn("Không phân tích được câu tìm kiếm AI '{}': {}", query, e.getMessage());
            return fallbackFilter(query);
        }
    }

    private ProductFilterRequestDto fallbackFilter(String query) {
        return ProductFilterRequestDto.builder().keyword(query).build();
    }

    private Schema buildFilterSchema(List<String> brandNames, List<String> categoryNames) {
        Map<String, Schema> properties = new LinkedHashMap<>();

        properties.put("keyword", Schema.builder()
                .type(Type.Known.STRING)
                .nullable(true)
                .description("Phần còn lại không khớp field nào khác, vd tên model cụ thể "
                        + "\"iPhone 15 Pro Max\". Để trống nếu không có.")
                .build());

        if (!brandNames.isEmpty()) {
            properties.put("brandNames", Schema.builder()
                    .type(Type.Known.ARRAY)
                    .items(Schema.builder().type(Type.Known.STRING).enum_(brandNames).build())
                    .description("Thương hiệu được nhắc tới, chỉ chọn trong danh sách hợp lệ.")
                    .build());
        }

        if (!categoryNames.isEmpty()) {
            properties.put("categoryNames", Schema.builder()
                    .type(Type.Known.ARRAY)
                    .items(Schema.builder().type(Type.Known.STRING).enum_(categoryNames).build())
                    .description("Loại sản phẩm được nhắc tới, chỉ chọn trong danh sách hợp lệ.")
                    .build());
        }

        properties.put("minPrice", Schema.builder().type(Type.Known.NUMBER).nullable(true)
                .description("Giá tối thiểu, đơn vị VNĐ").build());
        properties.put("maxPrice", Schema.builder().type(Type.Known.NUMBER).nullable(true)
                .description("Giá tối đa, đơn vị VNĐ").build());
        properties.put("ramGb", Schema.builder().type(Type.Known.ARRAY)
                .items(Schema.builder().type(Type.Known.INTEGER).build())
                .description("Dung lượng RAM mong muốn, đơn vị GB").build());
        properties.put("storageGb", Schema.builder().type(Type.Known.ARRAY)
                .items(Schema.builder().type(Type.Known.INTEGER).build())
                .description("Dung lượng bộ nhớ trong mong muốn, đơn vị GB").build());
        properties.put("colors", Schema.builder().type(Type.Known.ARRAY)
                .items(Schema.builder().type(Type.Known.STRING).build())
                .description("Màu sắc mong muốn").build());
        properties.put("operatingSystem", Schema.builder().type(Type.Known.STRING).nullable(true)
                .description("Hệ điều hành, vd iOS hoặc Android").build());
        properties.put("minScreenSize", Schema.builder().type(Type.Known.NUMBER).nullable(true)
                .description("Kích thước màn hình tối thiểu, đơn vị inch").build());
        properties.put("maxScreenSize", Schema.builder().type(Type.Known.NUMBER).nullable(true)
                .description("Kích thước màn hình tối đa, đơn vị inch").build());
        properties.put("minBatteryCapacity", Schema.builder().type(Type.Known.INTEGER).nullable(true)
                .description("Dung lượng pin tối thiểu, đơn vị mAh").build());
        properties.put("maxBatteryCapacity", Schema.builder().type(Type.Known.INTEGER).nullable(true)
                .description("Dung lượng pin tối đa, đơn vị mAh").build());
        properties.put("chipset", Schema.builder().type(Type.Known.STRING).nullable(true)
                .description("Tên chip, vd Snapdragon, Apple A17").build());
        properties.put("nfcSupported", Schema.builder().type(Type.Known.BOOLEAN).nullable(true)
                .description("Có yêu cầu hỗ trợ NFC hay không").build());
        properties.put("simType", Schema.builder().type(Type.Known.STRING).nullable(true)
                .description("Loại SIM, vd eSIM, Dual SIM").build());

        return Schema.builder().type(Type.Known.OBJECT).properties(properties).build();
    }
}
