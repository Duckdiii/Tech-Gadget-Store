package com.project.tech_gadget_store.entity.enums;

import com.project.tech_gadget_store.entity.Order;

public enum OrderStatus {
    AWAITING_CONFIRMATION {
        @Override
        public void confirm(Order order) {
            order.setOrderStatus(PROCESSING);
        }
        @Override
        public void markPaid(Order order) {
            confirm(order);
        }
        @Override
        public void cancel(Order order) {
            order.setOrderStatus(CANCELLED);
        }
        @Override
        public boolean canCancel() {
            return true;
        }
    },
    PROCESSING {
        @Override
        public void markShipping(Order order) {
            order.setOrderStatus(SHIPPING);
        }
        @Override
        public void cancel(Order order) {
            order.setOrderStatus(CANCELLED);
        }
        @Override
        public boolean canCancel() {
            return true;
        }
    },
    SHIPPING {
        @Override
        public void complete(Order order) {
            order.setOrderStatus(COMPLETED);
        }
    },
    COMPLETED,
    CANCELLED {
        @Override
        public void refund(Order order) {
            order.setOrderStatus(REFUNDED);
        }
    },
    REFUNDED;

    public void confirm(Order order) {
        throw new IllegalStateException("Cannot confirm order in state " + this);
    }
    public void markPaid(Order order) {
        // Do nothing by default
    }
    public void markShipping(Order order) {
        throw new IllegalStateException("Cannot ship order in state " + this);
    }
    public void complete(Order order) {
        throw new IllegalStateException("Cannot complete order in state " + this);
    }
    public void cancel(Order order) {
        throw new IllegalStateException("Cannot cancel order in state " + this);
    }
    public void refund(Order order) {
        throw new IllegalStateException("Cannot refund order in state " + this);
    }
    public boolean canCancel() {
        return false;
    }
}
