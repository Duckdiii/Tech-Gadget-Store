package com.project.tech_gadget_store.entity;

public class ProductFactory {

    public static Product createProduct(Category category, String name, String description, Brand brand) {
        String type = determineProductType(category);
        switch (type) {
            case "PHONE":
                return new Phone(name, description, brand, category);
            case "LAPTOP":
                return new Laptop(name, description, brand, category);
            case "HEADPHONES":
                return new Headphones(name, description, brand, category);
            case "SMARTWATCH":
                return new Smartwatch(name, description, brand, category);
            case "MONITOR":
                return new Monitor(name, description, brand, category);
            default:
                return new Product(name, description, brand, category);
        }
    }

    private static String determineProductType(Category category) {
        if (category == null || category.getName() == null) {
            return "PRODUCT";
        }
        String name = category.getName().toLowerCase();
        if (name.contains("phone") || name.contains("điện thoại")) {
            return "PHONE";
        }
        if (name.contains("laptop") || name.contains("máy tính xách tay") || name.contains("máy tính")) {
            return "LAPTOP";
        }
        if (name.contains("headphone") || name.contains("tai nghe")) {
            return "HEADPHONES";
        }
        if (name.contains("watch") || name.contains("đồng hồ")) {
            return "SMARTWATCH";
        }
        if (name.contains("monitor") || name.contains("màn hình")) {
            return "MONITOR";
        }
        return "PRODUCT";
    }
}
