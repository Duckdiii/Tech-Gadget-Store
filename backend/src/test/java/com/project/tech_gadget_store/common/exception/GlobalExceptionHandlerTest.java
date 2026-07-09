package com.project.tech_gadget_store.common.exception;

import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.warehouse.entity.Supplier;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import static org.assertj.core.api.Assertions.assertThat;




class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleMissingRequiredField_returnsBadRequestWithSpecMessage() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleMissingRequiredField(new MissingRequiredFieldException("Please fill in all required fields"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("message", "Please fill in all required fields");
    }

    @Test
    void handleDataAccessException_returnsServiceUnavailableWithSpecMessage() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleDataAccessException(new DataAccessResourceFailureException("connection refused"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody()).containsEntry("message", "Unable to connect to the system. Please try again later.");
    }

    @Test
    void handleDuplicateResource_returnsConflictWithGivenMessage() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleDuplicateResource(new DuplicateResourceException("Supplier name already exists. Please use a different name"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("message", "Supplier name already exists. Please use a different name");
    }

    @Test
    void handleSupplierEditRestricted_returnsConflictWithSpecMessage() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleSupplierEditRestricted(new SupplierEditRestrictedException("Some fields cannot be edited while there are Supply Orders"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("message", "Some fields cannot be edited while there are Supply Orders");
    }

    @Test
    void handleSupplierRemovalRestricted_returnsConflictWithSpecMessage() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleSupplierRemovalRestricted(new SupplierRemovalRestrictedException(
                        "Cannot remove supplier with active Purchase Orders. Please cancel or complete all related orders first"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("message",
                "Cannot remove supplier with active Purchase Orders. Please cancel or complete all related orders first");
    }

    @Test
    void handleNoOrderItems_returnsBadRequestWithSpecMessage() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleNoOrderItems(new NoOrderItemsException("Please add at least one product to the order"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("message", "Please add at least one product to the order");
    }

    @Test
    void handleInvalidOrderItem_returnsBadRequestWithSpecMessage() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleInvalidOrderItem(new InvalidOrderItemException("Quantity and unit price must be greater than zero"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("message", "Quantity and unit price must be greater than zero");
    }

    @Test
    void handleInvalidDeliveryDate_returnsBadRequestWithSpecMessage() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleInvalidDeliveryDate(new InvalidDeliveryDateException("Expected delivery date must be in the future"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("message", "Expected delivery date must be in the future");
    }

    @Test
    void handleInvalidStatusTransition_returnsBadRequestWithSpecMessage() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleInvalidStatusTransition(new InvalidStatusTransitionException(
                        "Invalid status transition. Please follow the correct order: PENDING → CONFIRMED → SHIPPING → DELIVERED"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("message",
                "Invalid status transition. Please follow the correct order: PENDING → CONFIRMED → SHIPPING → DELIVERED");
    }

    @Test
    void handleSupplyOrderFinalized_returnsConflictWithSpecMessage() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleSupplyOrderFinalized(new SupplyOrderFinalizedException(
                        "This Supply Order has already been completed or cancelled and cannot be updated"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("message",
                "This Supply Order has already been completed or cancelled and cannot be updated");
    }
}
