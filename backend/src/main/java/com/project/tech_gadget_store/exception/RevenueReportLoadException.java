package com.project.tech_gadget_store.exception;

public class RevenueReportLoadException extends RuntimeException {
    public RevenueReportLoadException(String message) {
        super(message);
    }

    public RevenueReportLoadException(String message, Throwable cause) {
        super(message, cause);
    }
}
