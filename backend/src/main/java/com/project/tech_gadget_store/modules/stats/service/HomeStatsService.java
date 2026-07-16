package com.project.tech_gadget_store.modules.stats.service;

import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.review.repository.ReviewRepository;
import com.project.tech_gadget_store.modules.stats.dto.response.HomeStatsResponseDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class HomeStatsService {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final ReviewRepository reviewRepository;

    public HomeStatsService(ProductRepository productRepository,
            CustomerRepository customerRepository,
            ReviewRepository reviewRepository) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.reviewRepository = reviewRepository;
    }

    public HomeStatsResponseDto getHomeStats() {
        return HomeStatsResponseDto.builder()
                .totalProducts(productRepository.count())
                .totalCustomers(customerRepository.count())
                .totalReviews(reviewRepository.count())
                .averageRating(reviewRepository.findAverageRating())
                .build();
    }
}
