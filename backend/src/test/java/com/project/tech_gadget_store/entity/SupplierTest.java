package com.project.tech_gadget_store.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SupplierTest {

    @Test
    void deactivate_setsIsActiveFalse() {
        Supplier supplier = new Supplier("Tech Corp", null, null, null);
        assertThat(supplier.getIsActive()).isTrue();

        supplier.deactivate();

        assertThat(supplier.getIsActive()).isFalse();
    }

    @Test
    void constructor_nullName_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> new Supplier(null, null, null, null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void constructor_blankName_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> new Supplier("   ", null, null, null))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
