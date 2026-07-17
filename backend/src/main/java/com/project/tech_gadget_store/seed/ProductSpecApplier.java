package com.project.tech_gadget_store.seed;

import com.project.tech_gadget_store.modules.catalog.entity.Headphones;
import com.project.tech_gadget_store.modules.catalog.entity.Laptop;
import com.project.tech_gadget_store.modules.catalog.entity.Monitor;
import com.project.tech_gadget_store.modules.catalog.entity.Phone;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.Smartwatch;
import java.math.BigDecimal;
import java.util.Random;

/**
 * Dispatches a {@link Product} to the right {@link ProductSpecGenerator} method by its actual
 * subtype and writes the generated values via setters. Shared by {@link CatalogSeeder} (fresh
 * products, where the instance is already known to be freshly-constructed) and
 * {@link ProductSpecSeeder} (topping up existing rows), so both apply specs identically.
 */
final class ProductSpecApplier {

    private ProductSpecApplier() {
    }

    static void apply(Product product, String categoryName, String brandName, BigDecimal referencePrice, Random random) {
        if (product instanceof Phone phone) {
            var specs = ProductSpecGenerator.generatePhoneSpecs(brandName, referencePrice, random);
            phone.setScreenSize(specs.screenSize());
            phone.setScreenResolution(specs.screenResolution());
            phone.setRearCamera(specs.rearCamera());
            phone.setFrontCamera(specs.frontCamera());
            phone.setChipset(specs.chipset());
            phone.setNfcSupported(specs.nfcSupported());
            phone.setBatteryCapacity(specs.batteryCapacity());
            phone.setSimType(specs.simType());
            phone.setOperatingSystem(specs.operatingSystem());
        } else if (product instanceof Laptop laptop) {
            var specs = ProductSpecGenerator.generateLaptopSpecs(brandName, referencePrice, random);
            laptop.setCpu(specs.cpu());
            laptop.setGpu(specs.gpu());
            laptop.setWeight(specs.weight());
            laptop.setScreenSize(specs.screenSize());
            laptop.setOperatingSystem(specs.operatingSystem());
        } else if (product instanceof Monitor monitor) {
            var specs = ProductSpecGenerator.generateMonitorSpecs(referencePrice, random);
            monitor.setScreenSize(specs.screenSize());
            monitor.setResolution(specs.resolution());
            monitor.setRefreshRate(specs.refreshRate());
            monitor.setPanelType(specs.panelType());
        } else if (product instanceof Headphones headphones) {
            var specs = ProductSpecGenerator.generateHeadphoneSpecs(referencePrice, random);
            headphones.setConnectorType(specs.connectorType());
            headphones.setIsWireless(specs.isWireless());
            headphones.setBatteryLifeHours(specs.batteryLifeHours());
            headphones.setHasNoiseCancelling(specs.hasNoiseCancelling());
        } else if (product instanceof Smartwatch smartwatch) {
            var specs = ProductSpecGenerator.generateSmartwatchSpecs(referencePrice, random);
            smartwatch.setBatteryLifeDays(specs.batteryLifeDays());
            smartwatch.setIsWaterResistant(specs.isWaterResistant());
            smartwatch.setHasGps(specs.hasGps());
        }
    }

    /** True if this product's category has a matching spec subtype (used to decide whether a row needs backfilling). */
    static boolean hasSpecFields(Product product) {
        return product instanceof Phone || product instanceof Laptop || product instanceof Monitor
                || product instanceof Headphones || product instanceof Smartwatch;
    }
}
