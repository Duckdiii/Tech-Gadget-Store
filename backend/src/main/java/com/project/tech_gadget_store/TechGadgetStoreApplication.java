package com.project.tech_gadget_store;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TechGadgetStoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(TechGadgetStoreApplication.class, args);
	}

}
