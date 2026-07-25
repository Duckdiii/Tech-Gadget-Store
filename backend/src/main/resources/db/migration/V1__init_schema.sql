-- Flyway Baseline V1 Migration Script
-- Tech Gadget Store Schema Definition

-- 1. AUTH & USER MODULE
CREATE TABLE IF NOT EXISTS memberships (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    rank INTEGER,
    discount_percentage NUMERIC(5,2),
    min_spending NUMERIC(15,2),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(150) NOT NULL CONSTRAINT uk_accounts_email UNIQUE,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL,
    user_id VARCHAR(36) NOT NULL CONSTRAINT uk_accounts_user UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    membership_id VARCHAR(36) NOT NULL REFERENCES memberships(id),
    preferred_payment_type VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS staffs (
    id VARCHAR(36) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    staff_code VARCHAR(40) NOT NULL CONSTRAINT uk_staffs_code UNIQUE,
    hire_date DATE
);

CREATE TABLE IF NOT EXISTS managers (
    id VARCHAR(36) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS addresses (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    phone VARCHAR(20),
    street VARCHAR(255),
    ward VARCHAR(100),
    district VARCHAR(100),
    province VARCHAR(100),
    type VARCHAR(30),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100),
    details TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS login_logs (
    id VARCHAR(36) PRIMARY KEY,
    account_id VARCHAR(36) REFERENCES accounts(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    user_agent VARCHAR(255),
    success BOOLEAN,
    login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_notes (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) REFERENCES customers(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 2. CATALOG MODULE
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL CONSTRAINT uk_categories_name UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS brands (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL CONSTRAINT uk_brands_name UNIQUE,
    logo_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    brand_id VARCHAR(36) NOT NULL REFERENCES brands(id),
    category_id VARCHAR(36) NOT NULL REFERENCES categories(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS laptops (
    id VARCHAR(36) PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    cpu VARCHAR(120),
    gpu VARCHAR(120),
    weight DOUBLE PRECISION,
    screen_size DOUBLE PRECISION,
    operating_system VARCHAR(120)
);

CREATE TABLE IF NOT EXISTS headphones (
    id VARCHAR(36) PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    connector_type VARCHAR(80),
    is_wireless BOOLEAN,
    battery_life_hours INTEGER,
    has_noise_cancelling BOOLEAN
);

CREATE TABLE IF NOT EXISTS monitors (
    id VARCHAR(36) PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    screen_size DOUBLE PRECISION,
    resolution VARCHAR(80),
    refresh_rate INTEGER,
    panel_type VARCHAR(80)
);

CREATE TABLE IF NOT EXISTS phones (
    id VARCHAR(36) PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    screen_size DOUBLE PRECISION,
    rear_camera VARCHAR(255),
    front_camera VARCHAR(255),
    chipset VARCHAR(120),
    nfc_supported BOOLEAN,
    battery_capacity INTEGER,
    sim_type VARCHAR(100),
    operating_system VARCHAR(120),
    screen_resolution VARCHAR(120)
);

CREATE TABLE IF NOT EXISTS smartwatches (
    id VARCHAR(36) PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    battery_life_days INTEGER,
    is_water_resistant BOOLEAN,
    has_gps BOOLEAN
);

CREATE TABLE IF NOT EXISTS product_images (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(150),
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ram_gb INTEGER,
    storage_gb INTEGER,
    color VARCHAR(80),
    price NUMERIC(15,2),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS product_serials (
    id VARCHAR(36) PRIMARY KEY,
    product_variant_id VARCHAR(36) NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    serial_number VARCHAR(100) NOT NULL CONSTRAINT uk_product_serials_number UNIQUE,
    status VARCHAR(30) NOT NULL,
    import_item_id VARCHAR(36),
    invoice_item_id VARCHAR(36),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS favorite_products (
    id VARCHAR(36) PRIMARY KEY,
    product_variant_id VARCHAR(36) NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    is_favorite BOOLEAN NOT NULL DEFAULT TRUE,
    subscribed_at TIMESTAMP NOT NULL,
    unsubscribed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_favorite_products_customer_product_variant UNIQUE (customer_id, product_variant_id)
);

CREATE TABLE IF NOT EXISTS customer_recommendation_cache (
    customer_id VARCHAR(36) NOT NULL,
    rank INTEGER NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    score DOUBLE PRECISION,
    generated_at TIMESTAMP NOT NULL,
    PRIMARY KEY (customer_id, rank)
);

CREATE TABLE IF NOT EXISTS recommendation_experiment_log (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    variant VARCHAR(30) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    clicked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 3. LOYALTY & PROMOTION MODULE
CREATE TABLE IF NOT EXISTS promotions (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) CONSTRAINT uk_promotions_code UNIQUE,
    name VARCHAR(150),
    discount_percentage NUMERIC(5,2),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS product_promotions (
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    promotion_id VARCHAR(36) NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, promotion_id)
);

CREATE TABLE IF NOT EXISTS bundle_services (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price NUMERIC(15,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS membership_benefits (
    id VARCHAR(36) PRIMARY KEY,
    membership_id VARCHAR(36) NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 4. ORDER & CART MODULE
CREATE TABLE IF NOT EXISTS carts (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL CONSTRAINT uk_carts_customer UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
    id VARCHAR(36) PRIMARY KEY,
    cart_id VARCHAR(36) NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_variant_id VARCHAR(36) NOT NULL REFERENCES product_variants(id),
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id),
    address_id VARCHAR(36) NOT NULL REFERENCES addresses(id),
    selected_payment_method_id VARCHAR(36) NOT NULL REFERENCES payment_methods(id),
    order_date TIMESTAMP NOT NULL,
    paid_at TIMESTAMP,
    order_status VARCHAR(40) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_variant_id VARCHAR(36) NOT NULL REFERENCES product_variants(id),
    quantity INTEGER NOT NULL,
    unit_price_at_order NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS order_item_bundle_services (
    order_item_id VARCHAR(36) NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    bundle_service_id VARCHAR(36) NOT NULL REFERENCES bundle_services(id),
    PRIMARY KEY (order_item_id, bundle_service_id)
);

CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL CONSTRAINT uk_invoices_order UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL CONSTRAINT uk_invoices_number UNIQUE,
    issue_date TIMESTAMP NOT NULL,
    total_amount NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_logs (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) REFERENCES orders(id) ON DELETE SET NULL,
    payment_method VARCHAR(30),
    transaction_id VARCHAR(100),
    amount NUMERIC(15,2),
    status VARCHAR(30),
    log_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 5. COUPON MODULE
CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL CONSTRAINT uk_coupons_code UNIQUE,
    discount_amount NUMERIC(15,2),
    discount_percentage NUMERIC(5,2),
    min_order_value NUMERIC(15,2),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    usage_limit INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_coupons (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    coupon_id VARCHAR(36) NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 6. REVIEW, CHAT & NOTIFICATION MODULE
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id),
    product_id VARCHAR(36) NOT NULL REFERENCES products(id),
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_conversations (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender VARCHAR(30) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    favorite_product_id VARCHAR(36) REFERENCES favorite_products(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 7. SETTINGS & WAREHOUSE MODULE
CREATE TABLE IF NOT EXISTS store_settings (
    id VARCHAR(36) PRIMARY KEY,
    key_name VARCHAR(100) NOT NULL CONSTRAINT uk_store_settings_key UNIQUE,
    value_text TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(150),
    address TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS receipts (
    id VARCHAR(36) PRIMARY KEY,
    receipt_code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS import_logs (
    id VARCHAR(36) PRIMARY KEY,
    import_code VARCHAR(50) NOT NULL UNIQUE,
    supplier_id VARCHAR(36) REFERENCES suppliers(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS import_log_items (
    id VARCHAR(36) PRIMARY KEY,
    import_log_id VARCHAR(36) NOT NULL REFERENCES import_logs(id) ON DELETE CASCADE,
    product_variant_id VARCHAR(36) NOT NULL REFERENCES product_variants(id),
    quantity INTEGER NOT NULL,
    unit_cost NUMERIC(15,2),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS export_logs (
    id VARCHAR(36) PRIMARY KEY,
    export_code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS export_log_items (
    id VARCHAR(36) PRIMARY KEY,
    export_log_id VARCHAR(36) NOT NULL REFERENCES export_logs(id) ON DELETE CASCADE,
    product_variant_id VARCHAR(36) NOT NULL REFERENCES product_variants(id),
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS supply_orders (
    id VARCHAR(36) PRIMARY KEY,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    supplier_id VARCHAR(36) REFERENCES suppliers(id),
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS supply_order_items (
    id VARCHAR(36) PRIMARY KEY,
    supply_order_id VARCHAR(36) NOT NULL REFERENCES supply_orders(id) ON DELETE CASCADE,
    product_variant_id VARCHAR(36) NOT NULL REFERENCES product_variants(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(15,2),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

    create table accounts (
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        status varchar(30) not null check ((status in ('ACTIVE','BLOCKED','DELETED'))),
        id varchar(36) not null,
        user_id varchar(36) not null unique,
        email varchar(150) not null,
        password varchar(255) not null,
        primary key (id),
        constraint uk_accounts_email unique (email)
    );

    create table addresses (
        is_default boolean default false not null,
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        phone varchar(20),
        type varchar(30),
        id varchar(36) not null,
        user_id varchar(36) not null,
        district varchar(100),
        name varchar(100),
        province varchar(100),
        ward varchar(100),
        street varchar(255),
        primary key (id)
    );

    create table audit_logs (
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        id varchar(36) not null,
        action varchar(50) not null,
        performed_by varchar(120) not null,
        details TEXT,
        primary key (id)
    );

    create table brands (
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        id varchar(36) not null,
        name varchar(100) not null unique,
        logo_url varchar(500),
        description TEXT,
        primary key (id)
    );

    create table bundle_services (
        active boolean not null,
        duration_months integer,
        price numeric(15,2) not null,
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        id varchar(36) not null,
        type varchar(40) not null check ((type in ('WARRANTY','SCREEN_PROTECTION'))),
        name varchar(120) not null,
        description TEXT,
        primary key (id)
    );

    create table cart_item_bundle_services (
        bundle_service_id varchar(36) not null,
        cart_item_id varchar(36) not null
    );

    create table cart_items (
        quantity integer not null,
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        cart_id varchar(36) not null,
        id varchar(36) not null,
        product_variant_id varchar(36) not null,
        primary key (id)
    );

    create table carts (
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        customer_id varchar(36) not null unique,
        id varchar(36) not null,
        primary key (id)
    );

    create table categories (
        display_order integer not null default 0 not null,
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        id varchar(36) not null,
        name varchar(100) not null unique,
        image_url varchar(500),
        primary key (id)
    );

    create table chat_conversation (
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        customer_id varchar(36) not null,
        id varchar(36) not null,
        primary key (id)
    );

    create table chat_message (
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        role varchar(20) not null check ((role in ('USER','ASSISTANT'))),
        conversation_id varchar(36) not null,
        id varchar(36) not null,
        content oid not null,
        primary key (id)
    );

    create table coupons (
        active boolean not null,
        discount_value numeric(38,2) not null,
        max_discount_amount numeric(38,2),
        min_order_amount numeric(38,2),
        usage_limit integer,
        created_at timestamp(6) not null,
        end_at timestamp(6) not null,
        start_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        discount_type varchar(20) not null check ((discount_type in ('PERCENT','FIXED'))),
        id varchar(36) not null,
        code varchar(40) not null,
        name varchar(150) not null,
        description TEXT,
        primary key (id),
        constraint uk_coupons_code unique (code)
    );

    create table customer_coupons (
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        used_at timestamp(6),
        coupon_id varchar(36) not null,
        customer_id varchar(36) not null,
        id varchar(36) not null,
        primary key (id),
        constraint uk_customer_coupon unique (customer_id, coupon_id)
    );

    create table customer_notes (
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        customer_id varchar(36) not null,
        id varchar(36) not null,
        author_name varchar(120) not null,
        content TEXT not null,
        primary key (id)
    );

    create table customer_recommendation_cache (
        rank integer not null,
        score float(53),
        generated_at timestamp(6) not null,
        customer_id varchar(36) not null,
        product_id varchar(36) not null,
        primary key (rank, customer_id)
    );

    create table customers (
        preferred_payment_type varchar(20),
        id varchar(36) not null,
        membership_id varchar(36) not null,
        primary key (id)
    );

    create table export_log_items (
        quantity integer not null,
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        export_log_id varchar(36) not null,
        id varchar(36) not null,
        product_variant_id varchar(36) not null,
        primary key (id)
    );

    create table export_logs (
        created_at timestamp(6) not null,
        exported_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        status varchar(30) not null check ((status in ('SUCCESS','FAILURE','PENDING'))),
        id varchar(36) not null,
        performed_by varchar(120) not null,
        reason TEXT,
        primary key (id)
    );

    create table favorite_products (
        is_favorite boolean default true not null,
        created_at timestamp(6) not null,
        subscribed_at timestamp(6) not null,
        unsubscribed_at timestamp(6),
        updated_at timestamp(6) not null,
        status varchar(30) not null check ((status in ('SUBSCRIBED','UNSUBSCRIBED'))),
        customer_id varchar(36) not null,
        id varchar(36) not null,
        product_variant_id varchar(36) not null,
        primary key (id),
        constraint uk_favorite_products_customer_product_variant unique (customer_id, product_variant_id)
    );

    create table headphones (
        battery_life_hours integer,
        has_noise_cancelling boolean,
        is_wireless boolean,
        id varchar(36) not null,
        connector_type varchar(80),
        primary key (id)
    );

    create table import_log_items (
        import_price numeric(38,2) not null,
        quantity integer not null,
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        id varchar(36) not null,
        import_log_id varchar(36) not null,
        product_variant_id varchar(36) not null,
        primary key (id)
    );

    create table import_logs (
        created_at timestamp(6) not null,
        imported_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        status varchar(30) not null check ((status in ('SUCCESS','FAILURE','PENDING'))),
        id varchar(36) not null,
        performed_by varchar(120) not null,
        note TEXT,
        primary key (id)
    );

    create table invoices (
        discount_amount numeric(15,2) not null,
        final_amount numeric(15,2) not null,
        original_amount numeric(15,2) not null,
        vat_amount numeric(15,2) not null,
        created_at timestamp(6) not null,
        issued_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        id varchar(36) not null,
        order_id varchar(36) not null unique,
        primary key (id)
    );

    create table laptops (
        screen_size float(53),
        weight float(53),
        id varchar(36) not null,
        cpu varchar(120),
        gpu varchar(120),
        operating_system varchar(120),
        primary key (id)
    );

    create table login_logs (
        created_at timestamp(6) not null,
        login_time timestamp(6) not null,
        updated_at timestamp(6) not null,
        login_status varchar(30) not null check ((login_status in ('SUCCESS','FAILED'))),
        account_id varchar(36) not null,
        id varchar(36) not null,
        role_name varchar(50),
        email varchar(150) not null,
        primary key (id)
    );

    create table managers (
        id varchar(36) not null,
        primary key (id)
    );

    create table membership_benefits (
        discount_percentage float(53) not null,
        free_shipping boolean not null,
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        id varchar(36) not null,
        description TEXT,
        primary key (id)
    );

    create table memberships (
        max_spending numeric(15,2),
        min_spending numeric(15,2),
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        tier varchar(30) not null check ((tier in ('STANDARD','BRONZE','SILVER','GOLD','DIAMOND'))),
        benefit_id varchar(36) not null unique,
        id varchar(36) not null,
        primary key (id),
        constraint uk_memberships_tier unique (tier)
    );

    create table monitors (
        refresh_rate integer,
        screen_size float(53),
        id varchar(36) not null,
        panel_type varchar(80),
        resolution varchar(80),
        primary key (id)
    );

    create table notification_channels (
        channel varchar(20) not null check ((channel in ('EMAIL','WEB'))),
        notification_id varchar(36) not null
    );

    create table notifications (
        created_at timestamp(6) not null,
        read_at timestamp(6),
        sent_at timestamp(6),
        updated_at timestamp(6) not null,
        status varchar(30) not null check ((status in ('SUCCESS','PENDING','FAILURE'))),
        customer_id varchar(36) not null,
        favorite_product_id varchar(36),
        id varchar(36) not null,
        type varchar(40) not null check ((type in ('STOCK_CHANGE','OUT_OF_STOCK','RESTOCKED','PRICE_UPDATE','PROMOTION','LOW_STOCK','IMPORT_STOCK','EXPORT_STOCK','ORDER_PLACED'))),
        title varchar(150) not null,
        message TEXT,
        primary key (id)
    );

    create table order_item_bundle_services (
        bundle_service_id varchar(36) not null,
        order_item_id varchar(36) not null
    );

    create table order_items (
        quantity integer not null,
        unit_price_at_order numeric(15,2) not null,
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        id varchar(36) not null,
        order_id varchar(36) not null,
        product_variant_id varchar(36) not null,
        primary key (id)
    );

    create table orders (
        created_at timestamp(6) not null,
        order_date timestamp(6) not null,
        paid_at timestamp(6),
        updated_at timestamp(6) not null,
        address_id varchar(36) not null,
        customer_id varchar(36) not null,
        id varchar(36) not null,
        selected_payment_method_id varchar(36) not null,
        order_status varchar(40) not null check ((order_status in ('AWAITING_CONFIRMATION','PROCESSING','SHIPPING','COMPLETED','CANCELLED','REFUNDED'))),
        primary key (id)
    );

    create table payment_logs (
        amount numeric(15,2) not null,
        created_at timestamp(6) not null,
        paid_at timestamp(6),
        updated_at timestamp(6) not null,
        id varchar(36) not null,
        order_id varchar(36),
        status varchar(40) not null check ((status in ('SUCCESS','FAILED','PENDING','CANCELLED','REFUNDED'))),
        failure_reason TEXT,
        primary key (id)
    );

    create table payment_methods (
        enabled boolean not null,
        max_amount numeric(15,2),
        service_fee numeric(15,2),
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        payment_type varchar(31) not null check ((payment_type in ('COD','MOMO','VNPAY'))),
        id varchar(36) not null,
        merchant_id varchar(100),
        name varchar(100) not null,
        partner_code varchar(100),
        terminal_code varchar(100),
        endpoint_url varchar(500),
        notify_url varchar(500),
        return_url varchar(500),
        description TEXT,
        hash_secret varchar(255),
        primary key (id)
    );

    create table phones (
        battery_capacity integer,
        nfc_supported boolean,
        screen_size float(53),
        id varchar(36) not null,
        sim_type varchar(100),
        chipset varchar(120),
        operating_system varchar(120),
        screen_resolution varchar(120),
        front_camera varchar(255),
        rear_camera varchar(255),
        primary key (id)
    );

    create table product_images (
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        id varchar(36) not null,
        product_id varchar(36) not null,
        name varchar(150),
        image_url varchar(500) not null,
        primary key (id)
    );

    create table product_promotions (
        product_id varchar(36) not null,
        promotion_id varchar(36) not null
    );

    create table product_serials (
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        status varchar(30) not null check ((status in ('IN_STOCK','SOLD','WARRANTY','RETURNED'))),
        id varchar(36) not null,
        import_item_id varchar(36),
        invoice_item_id varchar(36),
        product_variant_id varchar(36) not null,
        serial_number varchar(100) not null unique,
        primary key (id)
    );

    create table product_variants (
        price numeric(15,2),
        ram_gb integer,
        storage_gb integer,
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        id varchar(36) not null,
        product_id varchar(36) not null,
        color varchar(80),
        primary key (id)
    );

    create table products (
        is_active boolean not null default true not null,
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        brand_id varchar(36) not null,
        category_id varchar(36) not null,
        id varchar(36) not null,
        name varchar(150) not null,
        description TEXT,
        primary key (id)
    );

    create table promotion_target_tiers (
        promotion_id varchar(36) not null,
        tier varchar(255)
    );

    create table promotions (
        active boolean not null,
        discount_percent float(53) not null,
        usage_limit integer not null,
        created_at timestamp(6) not null,
        end_at timestamp(6) not null,
        start_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        id varchar(36) not null,
        code varchar(80) not null,
        name varchar(150) not null,
        image_url varchar(255),
        primary key (id),
        constraint uk_promotions_code unique (code)
    );

    create table receipts (
        created_at timestamp(6) not null,
        issued_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        export_log_id varchar(36) not null unique,
        id varchar(36) not null,
        file_url varchar(500),
        primary key (id)
    );

    create table recommendation_experiment_log (
        clicked_at timestamp(6),
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        variant varchar(30) not null,
        customer_id varchar(36) not null,
        id varchar(36) not null,
        product_id varchar(36) not null,
        primary key (id)
    );

    create table reviews (
        rating integer,
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        id varchar(36) not null,
        parent_id varchar(36),
        product_id varchar(36) not null,
        user_id varchar(36) not null,
        content TEXT not null,
        primary key (id)
    );

    create table smartwatches (
        battery_life_days integer,
        has_gps boolean,
        is_water_resistant boolean,
        id varchar(36) not null,
        primary key (id)
    );

    create table staffs (
        hire_date date,
        id varchar(36) not null,
        staff_code varchar(40) not null unique,
        primary key (id)
    );

    create table store_settings (
        allow_product_reviews boolean not null,
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        contact_phone varchar(30),
        id varchar(36) not null,
        contact_email varchar(150) not null,
        store_name varchar(150) not null,
        address varchar(255),
        primary key (id)
    );

    create table suppliers (
        is_active boolean not null,
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        phone varchar(20),
        id varchar(36) not null,
        email varchar(150),
        name varchar(150) not null unique,
        address TEXT,
        primary key (id)
    );

    create table supply_order_items (
        quantity integer not null,
        unit_price numeric(19,2) not null,
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        id varchar(36) not null,
        product_variant_id varchar(36) not null,
        supply_order_id varchar(36) not null,
        primary key (id)
    );

    create table supply_orders (
        expected_delivery_date date,
        order_date date not null,
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        status varchar(20) not null check ((status in ('PENDING','CONFIRMED','SHIPPING','DELIVERED','CANCELLED'))),
        id varchar(36) not null,
        supplier_id varchar(36) not null,
        notes TEXT,
        primary key (id)
    );

    create table support_tickets (
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        status varchar(20) not null check ((status in ('OPEN','IN_PROGRESS','RESOLVED','CLOSED'))),
        customer_id varchar(36) not null,
        id varchar(36) not null,
        category varchar(60) not null,
        subject varchar(200) not null,
        message TEXT not null,
        primary key (id)
    );

    create table users (
        created_at timestamp(6) not null,
        updated_at timestamp(6) not null,
        phone varchar(20),
        id varchar(36) not null,
        full_name varchar(120) not null,
        primary key (id)
    );

    alter table if exists accounts 
       add constraint FKnjuop33mo69pd79ctplkck40n 
       foreign key (user_id) 
       references users;

    alter table if exists addresses 
       add constraint FK1fa36y2oqhao3wgg2rw1pi459 
       foreign key (user_id) 
       references users;

    alter table if exists cart_item_bundle_services 
       add constraint FK3t585kwojlacboxwd0px1fc8v 
       foreign key (bundle_service_id) 
       references bundle_services;

    alter table if exists cart_item_bundle_services 
       add constraint FK5tjgm95vsh3a2lsbhpllxmh9u 
       foreign key (cart_item_id) 
       references cart_items;

    alter table if exists cart_items 
       add constraint FKn1s4l7h0vm4o259wpu7ft0y2y 
       foreign key (product_variant_id) 
       references product_variants;

    alter table if exists cart_items 
       add constraint FKpcttvuq4mxppo8sxggjtn5i2c 
       foreign key (cart_id) 
       references carts;

    alter table if exists carts 
       add constraint FK8ba3sryid5k8a9kidpkvqipyt 
       foreign key (customer_id) 
       references customers;

    alter table if exists customer_coupons 
       add constraint FKc85sxaysivd1ufxu7a8q1oyki 
       foreign key (coupon_id) 
       references coupons;

    alter table if exists customer_coupons 
       add constraint FKi6seta4h8opvply2e9hxs674m 
       foreign key (customer_id) 
       references customers;

    alter table if exists customer_notes 
       add constraint FKmlqmw0fgfmurvcmhkeqtdq7qs 
       foreign key (customer_id) 
       references customers;

    alter table if exists customers 
       add constraint FKa05wbib8rj9goai658v5g7ce4 
       foreign key (membership_id) 
       references memberships;

    alter table if exists customers 
       add constraint FKpog72rpahj62h7nod9wwc28if 
       foreign key (id) 
       references users;

    alter table if exists export_log_items 
       add constraint FKgrepohyv6beoy3yqn5q7wf1w1 
       foreign key (product_variant_id) 
       references product_variants;

    alter table if exists export_log_items 
       add constraint FKfrkkwueenkqr6a9gwdhosjkmv 
       foreign key (export_log_id) 
       references export_logs;

    alter table if exists favorite_products 
       add constraint FK45ettyo1mpwr769wk47cdxhl4 
       foreign key (customer_id) 
       references customers;

    alter table if exists favorite_products 
       add constraint FKabyewuy5ayp1e7lky979l3bs6 
       foreign key (product_variant_id) 
       references product_variants;

    alter table if exists headphones 
       add constraint FKqrd3bfeboe7iq1rvm2n3ffn9l 
       foreign key (id) 
       references products;

    alter table if exists import_log_items 
       add constraint FKeyvvme4kvf618rhbbkmgfy83q 
       foreign key (product_variant_id) 
       references product_variants;

    alter table if exists import_log_items 
       add constraint FKr93l6mp8oe1xl7mf9ypb0xxn1 
       foreign key (import_log_id) 
       references import_logs;

    alter table if exists invoices 
       add constraint FK4ko3y00tkkk2ya3p6wnefjj2f 
       foreign key (order_id) 
       references orders;

    alter table if exists laptops 
       add constraint FKc2vxqdy4uk247x24e5xoyq3jl 
       foreign key (id) 
       references products;

    alter table if exists login_logs 
       add constraint FKofjfbi0tlitaqkibvevc0w8sm 
       foreign key (account_id) 
       references accounts;

    alter table if exists managers 
       add constraint FKo602exy2392s7gi9as93mio60 
       foreign key (id) 
       references users;

    alter table if exists memberships 
       add constraint FKg5el0m85hil6ht13udpiiciys 
       foreign key (benefit_id) 
       references membership_benefits;

    alter table if exists monitors 
       add constraint FK1o9yvyptvs6yoa9m24sy4i0o4 
       foreign key (id) 
       references products;

    alter table if exists notification_channels 
       add constraint FKmpsidir1onjqphb9jl5a0ie2s 
       foreign key (notification_id) 
       references notifications;

    alter table if exists notifications 
       add constraint FKc94cts1ygm7394xj40x1yov1k 
       foreign key (customer_id) 
       references users;

    alter table if exists notifications 
       add constraint FKiw47pt4gy5y5ehe4604fqheas 
       foreign key (favorite_product_id) 
       references favorite_products;

    alter table if exists order_item_bundle_services 
       add constraint FKs06sgt5fjn3lvp0g0ovy7vale 
       foreign key (bundle_service_id) 
       references bundle_services;

    alter table if exists order_item_bundle_services 
       add constraint FKd9uwye7i79ymyv9i7o0y8a9g0 
       foreign key (order_item_id) 
       references order_items;

    alter table if exists order_items 
       add constraint FKltmtlue0wixrg1cf0xo7x0l4d 
       foreign key (product_variant_id) 
       references product_variants;

    alter table if exists order_items 
       add constraint FKbioxgbv59vetrxe0ejfubep1w 
       foreign key (order_id) 
       references orders;

    alter table if exists orders 
       add constraint FKhlglkvf5i60dv6dn397ethgpt 
       foreign key (address_id) 
       references addresses;

    alter table if exists orders 
       add constraint FKpxtb8awmi0dk6smoh2vp1litg 
       foreign key (customer_id) 
       references customers;

    alter table if exists orders 
       add constraint FK9p0hwbmw3oxj0kdpb8f1dfsr5 
       foreign key (selected_payment_method_id) 
       references payment_methods;

    alter table if exists payment_logs 
       add constraint FK29ygux4a0q924wl7gs0h7l99g 
       foreign key (order_id) 
       references orders;

    alter table if exists phones 
       add constraint FKiye801tdn46usw19faql16lqk 
       foreign key (id) 
       references products;

    alter table if exists product_images 
       add constraint FKqnq71xsohugpqwf3c9gxmsuy 
       foreign key (product_id) 
       references products;

    alter table if exists product_promotions 
       add constraint FKqmcm2exr3u4h8gxekpru47vqb 
       foreign key (promotion_id) 
       references promotions;

    alter table if exists product_promotions 
       add constraint FK5li9b7on7wrh01p4ikflvjvx6 
       foreign key (product_id) 
       references products;

    alter table if exists product_serials 
       add constraint FKb3aua317tcxe9s47weecqtn77 
       foreign key (product_variant_id) 
       references product_variants;

    alter table if exists product_variants 
       add constraint FKosqitn4s405cynmhb87lkvuau 
       foreign key (product_id) 
       references products;

    alter table if exists products 
       add constraint FKa3a4mpsfdf4d2y6r8ra3sc8mv 
       foreign key (brand_id) 
       references brands;

    alter table if exists products 
       add constraint FKog2rp4qthbtt2lfyhfo32lsw9 
       foreign key (category_id) 
       references categories;

    alter table if exists promotion_target_tiers 
       add constraint FKbdf7cdbkm7xtmr3kjv15ma2eu 
       foreign key (promotion_id) 
       references promotions;

    alter table if exists receipts 
       add constraint FK4riagxynetvo7t2tv9qxqsk9w 
       foreign key (export_log_id) 
       references export_logs;

    alter table if exists reviews 
       add constraint FK7qpkv66dxpmph7fcilu9ucqtc 
       foreign key (parent_id) 
       references reviews;

    alter table if exists reviews 
       add constraint FKpl51cejpw4gy5swfar8br9ngi 
       foreign key (product_id) 
       references products;

    alter table if exists reviews 
       add constraint FKcgy7qjc1r99dp117y9en6lxye 
       foreign key (user_id) 
       references users;

    alter table if exists smartwatches 
       add constraint FK8ubh1rqm4daw6mqwxcft2u79m 
       foreign key (id) 
       references products;

    alter table if exists staffs 
       add constraint FKdrcbb0t4jyjslw24sf1tkfk2p 
       foreign key (id) 
       references users;

    alter table if exists supply_order_items 
       add constraint FKprrhopwtf9fftw9h22fhm861t 
       foreign key (product_variant_id) 
       references product_variants;

    alter table if exists supply_order_items 
       add constraint FKj25fry47gkk8ipdkiknpy41so 
       foreign key (supply_order_id) 
       references supply_orders;

    alter table if exists supply_orders 
       add constraint FK5i5oe7rcphyrbd7kmv0gh7p9a 
       foreign key (supplier_id) 
       references suppliers;

    alter table if exists support_tickets 
       add constraint FKbj61s5pm6gwms5405fcdvgm1t 
       foreign key (customer_id) 
       references customers;
