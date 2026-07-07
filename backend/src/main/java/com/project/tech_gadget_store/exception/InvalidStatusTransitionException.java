package com.project.tech_gadget_store.exception;

public class InvalidStatusTransitionException extends RuntimeException {

    public InvalidStatusTransitionException(String message) {
        super(message);
    }
}
