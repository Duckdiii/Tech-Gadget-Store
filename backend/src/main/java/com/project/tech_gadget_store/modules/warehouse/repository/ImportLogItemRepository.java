package com.project.tech_gadget_store.modules.warehouse.repository;

import com.project.tech_gadget_store.modules.warehouse.entity.ImportLogItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ImportLogItemRepository extends JpaRepository<ImportLogItem, String> {

    @Query("SELECT ili.productVariant.id, AVG(ili.importPrice) FROM ImportLogItem ili GROUP BY ili.productVariant.id")
    List<Object[]> findAverageImportPricePerVariant();
}
