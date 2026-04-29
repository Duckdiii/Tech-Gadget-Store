package com.project.tech_gadget_store.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public abstract class BaseBusinessException extends RuntimeException { // Lá»›p cha cá»§a má»i lá»—i nghiá»‡p vá»¥
    private final HttpStatus httpStatus;

    public BaseBusinessException(String message, HttpStatus httpStatus) {
        super(message); // Gá»i constructor cá»§a RuntimeException Ä‘á»ƒ set message
        this.httpStatus = httpStatus;
    }
}
