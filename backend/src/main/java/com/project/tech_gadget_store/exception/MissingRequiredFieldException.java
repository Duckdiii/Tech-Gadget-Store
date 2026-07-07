package com.project.tech_gadget_store.exception;

public class MissingRequiredFieldException extends RuntimeException {

    public MissingRequiredFieldException(String message) {
        super(message);
    }
}
