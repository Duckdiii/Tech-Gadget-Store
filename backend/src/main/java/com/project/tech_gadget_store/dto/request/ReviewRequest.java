package com.project.tech_gadget_store.dto.request;

import java.sql.Timestamp;

public class ReviewRequest {
    private String comment;
    private Integer rating;
    private Timestamp createdAt;

    // Constructors, getters, and setters

    public ReviewRequest() {
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

}
