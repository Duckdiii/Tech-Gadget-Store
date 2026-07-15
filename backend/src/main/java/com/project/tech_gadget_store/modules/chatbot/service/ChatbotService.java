package com.project.tech_gadget_store.modules.chatbot.service;

import com.google.genai.Client;
import com.google.genai.ResponseStream;
import com.google.genai.types.Content;
import com.google.genai.types.FunctionCall;
import com.google.genai.types.FunctionDeclaration;
import com.google.genai.types.FunctionResponse;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.google.genai.types.Schema;
import com.google.genai.types.Tool;
import com.google.genai.types.Type;
import com.project.tech_gadget_store.config.ChatbotProperties;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.chatbot.dto.response.ChatStreamChunkDto;
import com.project.tech_gadget_store.modules.chatbot.entity.ChatConversation;
import com.project.tech_gadget_store.modules.chatbot.entity.ChatMessage;
import com.project.tech_gadget_store.modules.chatbot.entity.enums.ChatRole;
import com.project.tech_gadget_store.modules.chatbot.repository.ChatConversationRepository;
import com.project.tech_gadget_store.modules.chatbot.repository.ChatMessageRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ChatbotService {

    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý tư vấn mua sắm của cửa hàng thiết bị công nghệ TechStore.
            Chỉ trả lời các câu hỏi liên quan đến sản phẩm, đơn hàng và chính sách của cửa hàng.
            Nếu khách hỏi điều gì ngoài phạm vi này, hãy từ chối lịch sự và hướng khách quay lại
            chủ đề mua sắm.
            Luôn dùng hàm (function) được cung cấp để tra cứu thông tin sản phẩm/đơn hàng thật —
            không tự bịa tên sản phẩm, giá cả hay trạng thái đơn hàng.
            Trả lời ngắn gọn, thân thiện, bằng tiếng Việt.
            """;

    private static final int MAX_OUTPUT_TOKENS = 1024;
    private static final String CHAT_QUEUE_DESTINATION = "/queue/chatbot";// Đường dẫn gửi tin nhắn đẩy về FE trong lúc
                                                                          // streaming

    private final CustomerRepository customerRepository;
    private final ChatConversationRepository chatConversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatToolService chatToolService;
    private final ChatbotProperties chatbotProperties;
    private final SimpMessagingTemplate messagingTemplate;
    private final ExecutorService chatExecutor = Executors.newFixedThreadPool(4);
    private final Tool tool;

    public ChatbotService(
            CustomerRepository customerRepository,
            ChatConversationRepository chatConversationRepository,
            ChatMessageRepository chatMessageRepository,
            ChatToolService chatToolService,
            ChatbotProperties chatbotProperties,
            SimpMessagingTemplate messagingTemplate) {
        this.customerRepository = customerRepository;
        this.chatConversationRepository = chatConversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.chatToolService = chatToolService;
        this.chatbotProperties = chatbotProperties;
        this.messagingTemplate = messagingTemplate;
        this.tool = Tool.builder()
                .functionDeclarations(List.of(
                        searchProductsDeclaration(), getRecommendationsDeclaration(), getOrderStatusDeclaration()))
                .build();
    }

    // dùng để soạn ra tờ hướng dẫn, mô tả cho Gemini biết "có 1 công cụ tên
    // search_products, dùng để làm gì, cần thông tin gì" — chứ bản thân nó không đi
    // tìm sản phẩm nào cả.
    private FunctionDeclaration searchProductsDeclaration() {
        return FunctionDeclaration.builder()
                .name("search_products") // tên hàm mà model sẽ gọi
                .description( // mô tả ngắn gọn cho model biết hàm này làm gì, FE không cần biết
                        "Tìm kiếm sản phẩm đang bán trong cửa hàng theo từ khoá (tên sản phẩm, loại, "
                                + "thương hiệu...). Luôn gọi hàm này khi khách hỏi về sản phẩm cụ thể.")
                .parameters(Schema.builder()// mô tả các tham số mà hàm cần, model sẽ điền vào khi gọi hàm
                        .type(Type.Known.OBJECT)// kiểu dữ liệu là object (JSON object)
                        .properties(Map.of(// mô tả các thuộc tính của object
                                "keyword", // tên tham số
                                Schema.builder()// mô tả kiểu dữ liệu và ý nghĩa của tham số
                                        .type(Type.Known.STRING)// kiểu dữ liệu là string
                                        .description(// ý nghĩa của tham số, model sẽ điền vào khi gọi hàm
                                                "Từ khoá tìm kiếm sản phẩm, ví dụ \"laptop gaming dưới 20 triệu\"")
                                        .build()))// mô tả xong thuộc tính
                        .required(List.of("keyword"))// danh sách các thuộc tính bắt buộc phải có trong object
                        .build())// mô tả xong object
                .build();// kết thúc mô tả hàm
    }

    // dùng để soạn ra tờ hướng dẫn, mô tả cho Gemini biết "có 1 công cụ tên
    // get_recommendations, dùng để làm gì, cần thông tin gì" — chứ bản thân nó
    // không đi tìm sản phẩm nào cả.
    private FunctionDeclaration getRecommendationsDeclaration() {
        return FunctionDeclaration.builder()
                .name("get_recommendations")// tên hàm mà model sẽ gọi
                .description(// mô tả ngắn gọn cho model biết hàm này làm gì, FE không cần biết
                        "Lấy danh sách sản phẩm gợi ý cá nhân hoá (\"Dành cho bạn\") cho khách hàng đang chat. "
                                + "Dùng khi khách hỏi chung chung kiểu \"gợi ý cho tôi sản phẩm nào\" mà không nêu từ khoá cụ thể.")
                .parameters(Schema.builder().type(Type.Known.OBJECT).build())// mô tả các tham số mà hàm cần, model sẽ
                                                                             // điền vào khi gọi hàm — ở đây không cần
                                                                             // tham số gì cả
                .build();
    }

    // dùng để soạn ra tờ hướng dẫn, mô tả cho Gemini biết "có 1 công cụ tên
    // get_order_status, dùng để làm gì, cần thông tin gì" — chứ bản thân nó không
    // đi tìm sản phẩm nào cả.
    private FunctionDeclaration getOrderStatusDeclaration() {
        return FunctionDeclaration.builder()
                .name("get_order_status")
                .description("Tra cứu trạng thái đơn hàng của khách đang chat theo mã đơn hàng.")
                .parameters(Schema.builder()
                        .type(Type.Known.OBJECT)
                        .properties(Map.of(
                                "orderId",
                                Schema.builder()
                                        .type(Type.Known.STRING)
                                        .description("Mã đơn hàng cần tra cứu")
                                        .build()))
                        .required(List.of("orderId"))
                        .build())
                .build();
    }

    // dùng để xử lý tin nhắn từ FE gửi lên, chạy trong luồng riêng để không block
    // luồng chính
    public void handleMessage(String email, String content) {
        chatExecutor.execute(() -> processMessage(email, content));
    }

    // xử lý tin nhắn từ FE gửi lên, gọi Gemini API để trả lời, lưu lịch sử chat vào
    // DB,
    // đẩy tin nhắn trả lời về FE trong lúc streaming
    private void processMessage(String email, String content) {
        String conversationId = null;
        try {
            Customer customer = customerRepository
                    .findByAccountEmail(email)
                    .orElseThrow(() -> new IllegalStateException("Không tìm thấy khách hàng: " + email));
            String customerId = customer.getId();

            ChatConversation conversation = chatConversationRepository
                    .findTopByCustomerIdOrderByCreatedAtDesc(customerId)
                    .orElseGet(() -> chatConversationRepository.save(new ChatConversation(customerId)));
            conversationId = conversation.getId();

            chatMessageRepository.save(new ChatMessage(conversationId, ChatRole.USER, content));

            List<Content> contents = buildHistoryContents(conversationId); // Lấy lịch sử chat để gửi cho model, model
                                                                           // sẽ đọc và diễn giải lại

            Client client = buildClient();// Tạo client Gemini API với apiKey từ cấu hình
            GenerateContentConfig config = GenerateContentConfig.builder()// Cấu hình cho Gemini API
                    .systemInstruction(Content.fromParts(Part.fromText(SYSTEM_PROMPT)))
                    .maxOutputTokens(MAX_OUTPUT_TOKENS)
                    .tools(List.of(tool))
                    .build();

            String finalText = "";
            // Lặp nhiều vòng để model có thể gọi tool nhiều lần nếu cần, mỗi lần gọi tool
            // sẽ thêm 1 content mới vào contents
            for (int round = 0; round < chatbotProperties.getMaxToolRounds(); round++) {
                // Gọi Gemini API để trả lời, trong lúc streaming sẽ nhận được nhiều chunk, mỗi
                // chunk có thể là 1 đoạn text mới hoặc 1 function call
                RoundResult result = streamRound(client, email, conversationId, config, contents);
                // Lưu lại text cuối cùng để trả về FE khi kết thúc streaming
                finalText = result.text();

                if (!result.functionCalls().isEmpty()) {
                    contents.add(
                            Content.builder().role("model").parts(result.modelParts()).build());
                    contents.add(buildFunctionResponseContent(result.functionCalls(), customerId));
                } else {
                    break;
                }
            }

            chatMessageRepository.save(new ChatMessage(conversationId, ChatRole.ASSISTANT, finalText));
            sendChunk(email, conversationId, "", true, null);
        } catch (Exception e) {
            log.error("Chatbot xử lý tin nhắn thất bại cho {}", email, e);
            sendChunk(email, conversationId, "", true, "Đã có lỗi xảy ra, vui lòng thử lại sau.");
        }
    }

    private Client buildClient() { // Tạo client Gemini API với apiKey từ cấu hình
        String apiKey = chatbotProperties.getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("GEMINI_API_KEY chưa được cấu hình");
        }
        return Client.builder().apiKey(apiKey).build();
    }

    // Lấy lịch sử chat từ DB và chuyển thành danh sách Content để gửi cho model đọc
    // và diễn giải lại
    private List<Content> buildHistoryContents(String conversationId) {
        List<ChatMessage> history = chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        List<Content> contents = new ArrayList<>();
        for (ChatMessage message : history) {
            String role = message.getRole() == ChatRole.USER ? "user" : "model";
            contents.add(Content.builder()
                    .role(role)
                    .parts(List.of(Part.fromText(message.getContent())))
                    .build());
        }
        return contents;
    }

    // Gọi Gemini API để trả lời, trong lúc streaming sẽ nhận được nhiều chunk, mỗi
    // chunk có thể là 1 đoạn text mới hoặc 1 function call
    private RoundResult streamRound(
            Client client,
            String email,
            String conversationId,
            GenerateContentConfig config,
            List<Content> contents) {
        StringBuilder textBuilder = new StringBuilder(); // Dùng để lưu lại text cuối cùng để trả về FE khi kết thúc
                                                         // streaming
        List<FunctionCall> functionCalls = new ArrayList<>();// Dùng để lưu lại các function call mà model gọi trong lúc
                                                             // streaming, để trả về FE khi kết thúc streaming

        try (ResponseStream<GenerateContentResponse> stream = client.models
                .generateContentStream(chatbotProperties.getModel(), contents, config)) {// Gọi Gemini API để trả lời,
                                                                                         // trong lúc streaming sẽ nhận
                                                                                         // được nhiều chunk, mỗi chunk
                                                                                         // có thể là 1 đoạn text mới
                                                                                         // hoặc 1 function call
            for (GenerateContentResponse chunk : stream) {// Lặp qua từng chunk trong lúc streaming
                String textDelta = chunk.text();// Đoạn text mới nhận được từ model (rỗng ở khung cuối)
                if (textDelta != null && !textDelta.isEmpty()) {// Nếu có text mới thì append vào textBuilder và gửi
                                                                // chunk về FE trong lúc streaming
                    textBuilder.append(textDelta);// Lưu lại text cuối cùng để trả về FE khi kết thúc streaming
                    sendChunk(email, conversationId, textDelta, false, null);// Gửi chunk về FE trong lúc streaming, FE
                                                                             // sẽ append vào chatbox
                }
                functionCalls.addAll(chunk.functionCalls());// Nếu có function call thì lưu lại để trả về FE khi kết
                                                            // thúc streaming
            }
        }

        List<Part> modelParts = new ArrayList<>();// Dùng để lưu lại các part mà model trả về trong lúc streaming, để
                                                  // trả về FE khi kết thúc streaming
        if (!textBuilder.isEmpty()) {
            modelParts.add(Part.fromText(textBuilder.toString()));
        }
        for (FunctionCall functionCall : functionCalls) {
            modelParts.add(Part.builder().functionCall(functionCall).build());
        }

        return new RoundResult(textBuilder.toString(), functionCalls, modelParts);
    }

    // Xây dựng Content chứa kết quả trả về từ tool, để gửi cho model đọc và diễn
    // giải lại
    private Content buildFunctionResponseContent(List<FunctionCall> functionCalls, String customerId) {
        List<Part> responseParts = new ArrayList<>();
        for (FunctionCall functionCall : functionCalls) {
            String resultText = executeTool(functionCall, customerId);
            FunctionResponse.Builder responseBuilder = FunctionResponse.builder()
                    .name(functionCall.name().orElse(""))
                    .response(Map.of("result", resultText));
            functionCall.id().ifPresent(responseBuilder::id);
            responseParts.add(
                    Part.builder().functionResponse(responseBuilder.build()).build());
        }
        return Content.builder().role("user").parts(responseParts).build();
    }

    // Thực thi tool dựa trên tên hàm và tham số mà model gọi, trả về kết quả là 1
    private String executeTool(FunctionCall functionCall, String customerId) {
        String name = functionCall.name().orElse("");// Lấy tên hàm mà model gọi
        Map<String, Object> args = functionCall.args().orElse(Map.of());// Lấy tham số mà model điền vào khi gọi hàm
        try {
            return switch (name) {// Dựa trên tên hàm mà model gọi, gọi thẳng service nghiệp vụ đã có sẵn để lấy
                                  // dữ liệu thật
                case "search_products" -> chatToolService.searchProducts(String.valueOf(args.get("keyword")));
                case "get_recommendations" -> chatToolService.getRecommendations(customerId);
                case "get_order_status" ->
                    chatToolService.getOrderStatus(String.valueOf(args.get("orderId")), customerId);
                default -> "Tool không xác định: " + name;
            };
        } catch (Exception e) {
            log.error("Thực thi tool {} thất bại", name, e);
            return "Không thể lấy dữ liệu lúc này, vui lòng thử lại sau.";
        }
    }

    // streaming: nhận (hoặc gửi) dữ liệu theo từng mẩu nhỏ liên tục, thay vì đợi có
    // đủ hết mới
    // nhận 1 cục to
    // Gửi 1 chunk tin nhắn đẩy về FE trong lúc streaming, FE sẽ append vào chatbox
    private void sendChunk(String email, String conversationId, String delta, boolean done, String error) {
        messagingTemplate.convertAndSendToUser( // Gửi tin nhắn đẩy về FE trong lúc streaming, FE sẽ append vào chatbox
                email, // gửi cho user nào (theo email)
                CHAT_QUEUE_DESTINATION, // đường dẫn gửi tin nhắn đẩy về FE trong lúc streaming
                ChatStreamChunkDto.builder()// Dữ liệu gửi về FE trong lúc streaming
                        .conversationId(conversationId)
                        .delta(delta)
                        .done(done)
                        .error(error)
                        .build());
    }

    private record RoundResult(String text, List<FunctionCall> functionCalls, List<Part> modelParts) {
    }
}
