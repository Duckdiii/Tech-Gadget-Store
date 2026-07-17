package com.project.tech_gadget_store.modules.settings.repository;

import com.project.tech_gadget_store.modules.settings.entity.StoreSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface StoreSettingsRepository extends JpaRepository<StoreSettings, String> {
}
