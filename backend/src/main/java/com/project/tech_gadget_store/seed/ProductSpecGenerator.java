package com.project.tech_gadget_store.seed;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Random;

/**
 * Fills in category-specific technical specs (screen, chipset, battery, ...) that
 * {@link ProductFactory} leaves null on creation — {@code Phone}/{@code Laptop}/{@code Monitor}/
 * {@code Headphones}/{@code Smartwatch} only get their identity fields (name/brand/category) set
 * by the constructor, everything else is a plain setter nobody was calling. Values are picked
 * from category-appropriate pools, weighted by a price tier (derived from the product's price so
 * a budget phone doesn't get a flagship chipset) and, where it matters, by brand (Apple gets
 * Apple silicon/iOS, everyone else gets Android/Windows-shaped values).
 *
 * Shared by {@link CatalogSeeder} (fresh products) and {@link ProductSpecSeeder} (topping up
 * already-seeded rows), same as {@link ProductDescriptionGenerator}.
 */
final class ProductSpecGenerator {

    private ProductSpecGenerator() {
    }

    enum Tier { BUDGET, MID, PREMIUM }

    static Tier tierFor(BigDecimal price, BigDecimal midMax, BigDecimal highMin) {
        if (price == null) return Tier.MID;
        if (price.compareTo(highMin) >= 0) return Tier.PREMIUM;
        if (price.compareTo(midMax) >= 0) return Tier.MID;
        return Tier.BUDGET;
    }

    private static <T> T pick(List<T> options, Random random) {
        return options.get(random.nextInt(options.size()));
    }

    private static int randomBetween(int min, int max, Random random) {
        return min + random.nextInt(max - min + 1);
    }

    private static double randomBetween(double min, double max, Random random) {
        double raw = min + random.nextDouble() * (max - min);
        return BigDecimal.valueOf(raw).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private static boolean isApple(String brandName) {
        return brandName != null && brandName.equalsIgnoreCase("Apple");
    }

    // ---------------------------------------------------------------------------------------
    // Phone
    // ---------------------------------------------------------------------------------------

    record PhoneSpecs(double screenSize, String screenResolution, String rearCamera, String frontCamera,
            String chipset, boolean nfcSupported, int batteryCapacity, String simType, String operatingSystem) {
    }

    static PhoneSpecs generatePhoneSpecs(String brandName, BigDecimal price, Random random) {
        Tier tier = tierFor(price, new BigDecimal("10000000"), new BigDecimal("20000000"));
        boolean apple = isApple(brandName);

        double screenSize = randomBetween(5.4, 6.9, random);
        String resolution = switch (tier) {
            case BUDGET -> "720 x 1600";
            case MID -> "1080 x 2340";
            case PREMIUM -> "1080 x 2400";
        };
        String rearCamera = switch (tier) {
            case BUDGET -> "48MP chính";
            case MID -> "50MP chính + 8MP góc rộng";
            case PREMIUM -> "48MP chính + 12MP tele + 12MP góc rộng";
        };
        String frontCamera = switch (tier) {
            case BUDGET -> "8MP";
            case MID -> "16MP";
            case PREMIUM -> "32MP";
        };
        String chipset;
        if (apple) {
            chipset = switch (tier) {
                case BUDGET -> "Apple A15 Bionic";
                case MID -> "Apple A16 Bionic";
                case PREMIUM -> "Apple A17 Pro";
            };
        } else {
            chipset = switch (tier) {
                case BUDGET -> "Snapdragon 4 Gen 2";
                case MID -> "Snapdragon 7 Gen 3";
                case PREMIUM -> "Snapdragon 8 Gen 3";
            };
        }
        boolean nfc = tier != Tier.BUDGET || random.nextBoolean();
        int battery = randomBetween(3500, 5500, random);
        String simType = pick(List.of("Nano SIM + eSIM", "2 Nano SIM", "Nano SIM + eSIM (Dual SIM)"), random);
        String os = apple ? "iOS 17" : "Android 14";

        return new PhoneSpecs(screenSize, resolution, rearCamera, frontCamera, chipset, nfc, battery, simType, os);
    }

    // ---------------------------------------------------------------------------------------
    // Laptop
    // ---------------------------------------------------------------------------------------

    record LaptopSpecs(String cpu, String gpu, double weight, double screenSize, String operatingSystem) {
    }

    static LaptopSpecs generateLaptopSpecs(String brandName, BigDecimal price, Random random) {
        Tier tier = tierFor(price, new BigDecimal("20000000"), new BigDecimal("35000000"));
        boolean apple = isApple(brandName);

        String cpu;
        String gpu;
        if (apple) {
            cpu = switch (tier) {
                case BUDGET -> "Apple M1";
                case MID -> "Apple M2";
                case PREMIUM -> "Apple M3 Pro";
            };
            gpu = "GPU tích hợp " + cpu;
        } else {
            cpu = switch (tier) {
                case BUDGET -> "Intel Core i3-1315U";
                case MID -> "Intel Core i5-1340P";
                case PREMIUM -> "Intel Core i7-13700H";
            };
            gpu = switch (tier) {
                case BUDGET -> "Intel UHD Graphics";
                case MID -> "Intel Iris Xe Graphics";
                case PREMIUM -> "NVIDIA GeForce RTX 4060";
            };
        }
        double weight = randomBetween(1.2, 2.4, random);
        double screenSize = pick(List.of(13.3, 14.0, 15.6, 16.0), random);
        String os = apple ? "macOS Sonoma" : "Windows 11 Home";

        return new LaptopSpecs(cpu, gpu, weight, screenSize, os);
    }

    // ---------------------------------------------------------------------------------------
    // Monitor
    // ---------------------------------------------------------------------------------------

    record MonitorSpecs(double screenSize, String resolution, int refreshRate, String panelType) {
    }

    static MonitorSpecs generateMonitorSpecs(BigDecimal price, Random random) {
        Tier tier = tierFor(price, new BigDecimal("6000000"), new BigDecimal("12000000"));

        double screenSize = pick(List.of(23.8, 27.0, 32.0), random);
        String resolution = switch (tier) {
            case BUDGET -> "1920 x 1080";
            case MID -> "2560 x 1440";
            case PREMIUM -> "3840 x 2160";
        };
        int refreshRate = switch (tier) {
            case BUDGET -> pick(List.of(60, 75), random);
            case MID -> pick(List.of(100, 144), random);
            case PREMIUM -> pick(List.of(165, 240), random);
        };
        String panelType = switch (tier) {
            case BUDGET -> "VA";
            case MID -> "IPS";
            case PREMIUM -> pick(List.of("IPS", "OLED"), random);
        };

        return new MonitorSpecs(screenSize, resolution, refreshRate, panelType);
    }

    // ---------------------------------------------------------------------------------------
    // Headphones
    // ---------------------------------------------------------------------------------------

    record HeadphoneSpecs(String connectorType, boolean isWireless, int batteryLifeHours, boolean hasNoiseCancelling) {
    }

    static HeadphoneSpecs generateHeadphoneSpecs(BigDecimal price, Random random) {
        Tier tier = tierFor(price, new BigDecimal("2000000"), new BigDecimal("6000000"));

        boolean wireless = tier != Tier.BUDGET || random.nextBoolean();
        String connectorType = wireless ? "Bluetooth 5.3" : "Có dây 3.5mm";
        int batteryLife = wireless ? switch (tier) {
            case BUDGET -> randomBetween(6, 15, random);
            case MID -> randomBetween(15, 30, random);
            case PREMIUM -> randomBetween(30, 40, random);
        } : 0;
        boolean noiseCancelling = tier == Tier.PREMIUM || (tier == Tier.MID && random.nextBoolean());

        return new HeadphoneSpecs(connectorType, wireless, batteryLife, noiseCancelling);
    }

    // ---------------------------------------------------------------------------------------
    // Smartwatch
    // ---------------------------------------------------------------------------------------

    record SmartwatchSpecs(int batteryLifeDays, boolean isWaterResistant, boolean hasGps) {
    }

    static SmartwatchSpecs generateSmartwatchSpecs(BigDecimal price, Random random) {
        Tier tier = tierFor(price, new BigDecimal("5000000"), new BigDecimal("9000000"));

        int batteryLifeDays = switch (tier) {
            case BUDGET -> randomBetween(1, 3, random);
            case MID -> randomBetween(3, 7, random);
            case PREMIUM -> randomBetween(7, 14, random);
        };
        boolean waterResistant = tier != Tier.BUDGET || random.nextBoolean();
        boolean gps = tier == Tier.PREMIUM || (tier == Tier.MID && random.nextBoolean());

        return new SmartwatchSpecs(batteryLifeDays, waterResistant, gps);
    }
}
