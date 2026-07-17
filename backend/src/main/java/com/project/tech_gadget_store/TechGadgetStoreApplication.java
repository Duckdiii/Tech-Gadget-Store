package com.project.tech_gadget_store;

import java.util.TimeZone;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;


import org.springframework.data.web.config.EnableSpringDataWebSupport;

@SpringBootApplication
@EnableAsync
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class TechGadgetStoreApplication {

	public static void main(String[] args) {
		// Mọi timestamp "without time zone" trong Postgres được ghi bằng UTC (xem now() của DB).
		// Ép JVM mặc định UTC ngay từ đầu để LocalDateTime.now() ở khắp codebase khớp với DB —
		// nếu không, chạy trên máy có múi giờ khác UTC (vd. host Windows UTC+7) sẽ làm mọi so sánh
		// thời gian (khuyến mãi, token hết hạn, v.v.) bị lệch theo đúng độ lệch múi giờ của máy đó.
		TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
		SpringApplication.run(TechGadgetStoreApplication.class, args);
	}

}
