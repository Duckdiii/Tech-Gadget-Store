-- Flyway Baseline V1 Migration Script
-- Tech Gadget Store Schema Definition
-- Generated from Hibernate entity mappings (pg_dump --schema-only) to guarantee the schema
-- matches every @Entity exactly -- see backend deploy-readiness review for why this matters:
-- ddl-auto=validate requires this file to be a byte-for-byte match of what Hibernate expects.

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    status character varying(30) NOT NULL,
    id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    CONSTRAINT accounts_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'BLOCKED'::character varying, 'DELETED'::character varying])::text[])))
);

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.addresses (
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    phone character varying(20),
    type character varying(30),
    id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    district character varying(100),
    name character varying(100),
    province character varying(100),
    ward character varying(100),
    street character varying(255)
);

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    id character varying(36) NOT NULL,
    action character varying(50) NOT NULL,
    performed_by character varying(120) NOT NULL,
    details text
);

--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    id character varying(36) NOT NULL,
    name character varying(100) NOT NULL,
    logo_url character varying(500),
    description text
);

--
-- Name: bundle_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bundle_services (
    active boolean NOT NULL,
    duration_months integer,
    price numeric(15,2) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    id character varying(36) NOT NULL,
    type character varying(40) NOT NULL,
    name character varying(120) NOT NULL,
    description text,
    CONSTRAINT bundle_services_type_check CHECK (((type)::text = ANY ((ARRAY['WARRANTY'::character varying, 'SCREEN_PROTECTION'::character varying])::text[])))
);

--
-- Name: cart_item_bundle_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_item_bundle_services (
    bundle_service_id character varying(36) NOT NULL,
    cart_item_id character varying(36) NOT NULL
);

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    quantity integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    cart_id character varying(36) NOT NULL,
    id character varying(36) NOT NULL,
    product_variant_id character varying(36) NOT NULL
);

--
-- Name: carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carts (
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    customer_id character varying(36) NOT NULL,
    id character varying(36) NOT NULL
);

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    id character varying(36) NOT NULL,
    name character varying(100) NOT NULL,
    image_url character varying(500)
);

--
-- Name: chat_conversation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_conversation (
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    customer_id character varying(36) NOT NULL,
    id character varying(36) NOT NULL
);

--
-- Name: chat_message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_message (
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    role character varying(20) NOT NULL,
    conversation_id character varying(36) NOT NULL,
    id character varying(36) NOT NULL,
    content oid NOT NULL,
    CONSTRAINT chat_message_role_check CHECK (((role)::text = ANY ((ARRAY['USER'::character varying, 'ASSISTANT'::character varying])::text[])))
);

--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    active boolean NOT NULL,
    discount_value numeric(38,2) NOT NULL,
    max_discount_amount numeric(38,2),
    min_order_amount numeric(38,2),
    usage_limit integer,
    created_at timestamp(6) without time zone NOT NULL,
    end_at timestamp(6) without time zone NOT NULL,
    start_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    discount_type character varying(20) NOT NULL,
    id character varying(36) NOT NULL,
    code character varying(40) NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    CONSTRAINT coupons_discount_type_check CHECK (((discount_type)::text = ANY ((ARRAY['PERCENT'::character varying, 'FIXED'::character varying])::text[])))
);

--
-- Name: customer_coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_coupons (
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    used_at timestamp(6) without time zone,
    coupon_id character varying(36) NOT NULL,
    customer_id character varying(36) NOT NULL,
    id character varying(36) NOT NULL
);

--
-- Name: customer_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_notes (
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    customer_id character varying(36) NOT NULL,
    id character varying(36) NOT NULL,
    author_name character varying(120) NOT NULL,
    content text NOT NULL
);

--
-- Name: customer_recommendation_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_recommendation_cache (
    rank integer NOT NULL,
    score double precision,
    generated_at timestamp(6) without time zone NOT NULL,
    customer_id character varying(36) NOT NULL,
    product_id character varying(36) NOT NULL
);

--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    preferred_payment_type character varying(20),
    id character varying(36) NOT NULL,
    membership_id character varying(36) NOT NULL
);

--
-- Name: export_log_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.export_log_items (
    quantity integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    export_log_id character varying(36) NOT NULL,
    id character varying(36) NOT NULL,
    product_variant_id character varying(36) NOT NULL
);

--
-- Name: export_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.export_logs (
    created_at timestamp(6) without time zone NOT NULL,
    exported_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    status character varying(30) NOT NULL,
    id character varying(36) NOT NULL,
    performed_by character varying(120) NOT NULL,
    reason text,
    CONSTRAINT export_logs_status_check CHECK (((status)::text = ANY ((ARRAY['SUCCESS'::character varying, 'FAILURE'::character varying, 'PENDING'::character varying])::text[])))
);

--
-- Name: favorite_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorite_products (
    is_favorite boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    subscribed_at timestamp(6) without time zone NOT NULL,
    unsubscribed_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone NOT NULL,
    status character varying(30) NOT NULL,
    customer_id character varying(36) NOT NULL,
    id character varying(36) NOT NULL,
    product_variant_id character varying(36) NOT NULL,
    CONSTRAINT favorite_products_status_check CHECK (((status)::text = ANY ((ARRAY['SUBSCRIBED'::character varying, 'UNSUBSCRIBED'::character varying])::text[])))
);

--
-- Name: headphones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.headphones (
    battery_life_hours integer,
    has_noise_cancelling boolean,
    is_wireless boolean,
    id character varying(36) NOT NULL,
    connector_type character varying(80)
);

--
-- Name: import_log_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.import_log_items (
    import_price numeric(38,2) NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    id character varying(36) NOT NULL,
    import_log_id character varying(36) NOT NULL,
    product_variant_id character varying(36) NOT NULL
);

--
-- Name: import_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.import_logs (
    created_at timestamp(6) without time zone NOT NULL,
    imported_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    status character varying(30) NOT NULL,
    id character varying(36) NOT NULL,
    performed_by character varying(120) NOT NULL,
    note text,
    CONSTRAINT import_logs_status_check CHECK (((status)::text = ANY ((ARRAY['SUCCESS'::character varying, 'FAILURE'::character varying, 'PENDING'::character varying])::text[])))
);

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    discount_amount numeric(15,2) NOT NULL,
    final_amount numeric(15,2) NOT NULL,
    original_amount numeric(15,2) NOT NULL,
    vat_amount numeric(15,2) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    issued_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    id character varying(36) NOT NULL,
    order_id character varying(36) NOT NULL
);

--
-- Name: laptops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.laptops (
    screen_size double precision,
    weight double precision,
    id character varying(36) NOT NULL,
    cpu character varying(120),
    gpu character varying(120),
    operating_system character varying(120)
);

--
-- Name: login_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.login_logs (
    created_at timestamp(6) without time zone NOT NULL,
    login_time timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    login_status character varying(30) NOT NULL,
    account_id character varying(36) NOT NULL,
    id character varying(36) NOT NULL,
    role_name character varying(50),
    email character varying(150) NOT NULL,
    CONSTRAINT login_logs_login_status_check CHECK (((login_status)::text = ANY ((ARRAY['SUCCESS'::character varying, 'FAILED'::character varying])::text[])))
);

--
-- Name: managers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.managers (
    id character varying(36) NOT NULL
);

--
-- Name: membership_benefits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membership_benefits (
    discount_percentage double precision NOT NULL,
    free_shipping boolean NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    id character varying(36) NOT NULL,
    description text
);

--
-- Name: memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.memberships (
    max_spending numeric(15,2),
    min_spending numeric(15,2),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tier character varying(30) NOT NULL,
    benefit_id character varying(36) NOT NULL,
    id character varying(36) NOT NULL,
    CONSTRAINT memberships_tier_check CHECK (((tier)::text = ANY ((ARRAY['STANDARD'::character varying, 'BRONZE'::character varying, 'SILVER'::character varying, 'GOLD'::character varying, 'DIAMOND'::character varying])::text[])))
);

--
-- Name: monitors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.monitors (
    refresh_rate integer,
    screen_size double precision,
    id character varying(36) NOT NULL,
    panel_type character varying(80),
    resolution character varying(80)
);

--
-- Name: notification_channels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_channels (
    channel character varying(20) NOT NULL,
    notification_id character varying(36) NOT NULL,
    CONSTRAINT notification_channels_channel_check CHECK (((channel)::text = ANY ((ARRAY['EMAIL'::character varying, 'WEB'::character varying])::text[])))
);

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    created_at timestamp(6) without time zone NOT NULL,
    read_at timestamp(6) without time zone,
    sent_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone NOT NULL,
    status character varying(30) NOT NULL,
    customer_id character varying(36) NOT NULL,
    favorite_product_id character varying(36),
    id character varying(36) NOT NULL,
    type character varying(40) NOT NULL,
    title character varying(150) NOT NULL,
    message text,
    CONSTRAINT notifications_status_check CHECK (((status)::text = ANY ((ARRAY['SUCCESS'::character varying, 'PENDING'::character varying, 'FAILURE'::character varying])::text[]))),
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['STOCK_CHANGE'::character varying, 'OUT_OF_STOCK'::character varying, 'RESTOCKED'::character varying, 'PRICE_UPDATE'::character varying, 'PROMOTION'::character varying, 'LOW_STOCK'::character varying, 'IMPORT_STOCK'::character varying, 'EXPORT_STOCK'::character varying, 'ORDER_PLACED'::character varying])::text[])))
);

--
-- Name: order_item_bundle_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_item_bundle_services (
    bundle_service_id character varying(36) NOT NULL,
    order_item_id character varying(36) NOT NULL
);

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    quantity integer NOT NULL,
    unit_price_at_order numeric(15,2) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    id character varying(36) NOT NULL,
    order_id character varying(36) NOT NULL,
    product_variant_id character varying(36) NOT NULL
);

--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    created_at timestamp(6) without time zone NOT NULL,
    order_date timestamp(6) without time zone NOT NULL,
    paid_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone NOT NULL,
    address_id character varying(36) NOT NULL,
    customer_id character varying(36) NOT NULL,
    id character varying(36) NOT NULL,
    selected_payment_method_id character varying(36) NOT NULL,
    order_status character varying(40) NOT NULL,
    CONSTRAINT orders_order_status_check CHECK (((order_status)::text = ANY ((ARRAY['AWAITING_CONFIRMATION'::character varying, 'PROCESSING'::character varying, 'SHIPPING'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying, 'REFUNDED'::character varying])::text[])))
);

--
-- Name: payment_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_logs (
    amount numeric(15,2) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    paid_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone NOT NULL,
    id character varying(36) NOT NULL,
    order_id character varying(36),
    status character varying(40) NOT NULL,
    failure_reason text,
    CONSTRAINT payment_logs_status_check CHECK (((status)::text = ANY ((ARRAY['SUCCESS'::character varying, 'FAILED'::character varying, 'PENDING'::character varying, 'CANCELLED'::character varying, 'REFUNDED'::character varying])::text[])))
);

--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_methods (
    enabled boolean NOT NULL,
    max_amount numeric(15,2),
    service_fee numeric(15,2),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    payment_type character varying(31) NOT NULL,
    id character varying(36) NOT NULL,
    merchant_id character varying(100),
    name character varying(100) NOT NULL,
    partner_code character varying(100),
    terminal_code character varying(100),
    endpoint_url character varying(500),
    notify_url character varying(500),
    return_url character varying(500),
    description text,
    hash_secret character varying(255),
    CONSTRAINT payment_methods_payment_type_check CHECK (((payment_type)::text = ANY ((ARRAY['COD'::character varying, 'MOMO'::character varying, 'VNPAY'::character varying])::text[])))
);

--
-- Name: phones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.phones (
    battery_capacity integer,
    nfc_supported boolean,
    screen_size double precision,
    id character varying(36) NOT NULL,
    sim_type character varying(100),
    chipset character varying(120),
    operating_system character varying(120),
    screen_resolution character varying(120),
    front_camera character varying(255),
    rear_camera character varying(255)
);

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    id character varying(36) NOT NULL,
    product_id character varying(36) NOT NULL,
    name character varying(150),
    image_url character varying(500) NOT NULL
);

--
-- Name: product_promotions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_promotions (
    product_id character varying(36) NOT NULL,
    promotion_id character varying(36) NOT NULL
);

--
-- Name: product_serials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_serials (
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    status character varying(30) NOT NULL,
    id character varying(36) NOT NULL,
    import_item_id character varying(36),
    invoice_item_id character varying(36),
    product_variant_id character varying(36) NOT NULL,
    serial_number character varying(100) NOT NULL,
    CONSTRAINT product_serials_status_check CHECK (((status)::text = ANY ((ARRAY['IN_STOCK'::character varying, 'SOLD'::character varying, 'WARRANTY'::character varying, 'RETURNED'::character varying])::text[])))
);

--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variants (
    price numeric(15,2),
    ram_gb integer,
    storage_gb integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    id character varying(36) NOT NULL,
    product_id character varying(36) NOT NULL,
    color character varying(80)
);

--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    brand_id character varying(36) NOT NULL,
    category_id character varying(36) NOT NULL,
    id character varying(36) NOT NULL,
    name character varying(150) NOT NULL,
    description text
);

--
-- Name: promotion_target_tiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotion_target_tiers (
    promotion_id character varying(36) NOT NULL,
    tier character varying(255)
);

--
-- Name: promotions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotions (
    active boolean NOT NULL,
    discount_percent double precision NOT NULL,
    usage_limit integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    end_at timestamp(6) without time zone NOT NULL,
    start_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    id character varying(36) NOT NULL,
    code character varying(80) NOT NULL,
    name character varying(150) NOT NULL,
    image_url character varying(255)
);

--
-- Name: receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.receipts (
    created_at timestamp(6) without time zone NOT NULL,
    issued_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    export_log_id character varying(36) NOT NULL,
    id character varying(36) NOT NULL,
    file_url character varying(500)
);

--
-- Name: recommendation_experiment_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recommendation_experiment_log (
    clicked_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    variant character varying(30) NOT NULL,
    customer_id character varying(36) NOT NULL,
    id character varying(36) NOT NULL,
    product_id character varying(36) NOT NULL
);

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    rating integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    id character varying(36) NOT NULL,
    parent_id character varying(36),
    product_id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    content text NOT NULL
);

--
-- Name: smartwatches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.smartwatches (
    battery_life_days integer,
    has_gps boolean,
    is_water_resistant boolean,
    id character varying(36) NOT NULL
);

--
-- Name: staffs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staffs (
    hire_date date,
    id character varying(36) NOT NULL,
    staff_code character varying(40) NOT NULL
);

--
-- Name: store_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_settings (
    allow_product_reviews boolean NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    contact_phone character varying(30),
    id character varying(36) NOT NULL,
    contact_email character varying(150) NOT NULL,
    store_name character varying(150) NOT NULL,
    address character varying(255)
);

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    is_active boolean NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    phone character varying(20),
    id character varying(36) NOT NULL,
    email character varying(150),
    name character varying(150) NOT NULL,
    address text
);

--
-- Name: supply_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supply_order_items (
    quantity integer NOT NULL,
    unit_price numeric(19,2) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    id character varying(36) NOT NULL,
    product_variant_id character varying(36) NOT NULL,
    supply_order_id character varying(36) NOT NULL
);

--
-- Name: supply_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supply_orders (
    expected_delivery_date date,
    order_date date NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    status character varying(20) NOT NULL,
    id character varying(36) NOT NULL,
    supplier_id character varying(36) NOT NULL,
    notes text,
    CONSTRAINT supply_orders_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'CONFIRMED'::character varying, 'SHIPPING'::character varying, 'DELIVERED'::character varying, 'CANCELLED'::character varying])::text[])))
);

--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    status character varying(20) NOT NULL,
    customer_id character varying(36) NOT NULL,
    id character varying(36) NOT NULL,
    category character varying(60) NOT NULL,
    subject character varying(200) NOT NULL,
    message text NOT NULL,
    CONSTRAINT support_tickets_status_check CHECK (((status)::text = ANY ((ARRAY['OPEN'::character varying, 'IN_PROGRESS'::character varying, 'RESOLVED'::character varying, 'CLOSED'::character varying])::text[])))
);

--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    phone character varying(20),
    id character varying(36) NOT NULL,
    full_name character varying(120) NOT NULL
);

--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);

--
-- Name: accounts accounts_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_key UNIQUE (user_id);

--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);

--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);

--
-- Name: brands brands_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_name_key UNIQUE (name);

--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);

--
-- Name: bundle_services bundle_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bundle_services
    ADD CONSTRAINT bundle_services_pkey PRIMARY KEY (id);

--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);

--
-- Name: carts carts_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_customer_id_key UNIQUE (customer_id);

--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);

--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);

--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);

--
-- Name: chat_conversation chat_conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation
    ADD CONSTRAINT chat_conversation_pkey PRIMARY KEY (id);

--
-- Name: chat_message chat_message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_pkey PRIMARY KEY (id);

--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);

--
-- Name: customer_coupons customer_coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_coupons
    ADD CONSTRAINT customer_coupons_pkey PRIMARY KEY (id);

--
-- Name: customer_notes customer_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_pkey PRIMARY KEY (id);

--
-- Name: customer_recommendation_cache customer_recommendation_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_recommendation_cache
    ADD CONSTRAINT customer_recommendation_cache_pkey PRIMARY KEY (rank, customer_id);

--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);

--
-- Name: export_log_items export_log_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.export_log_items
    ADD CONSTRAINT export_log_items_pkey PRIMARY KEY (id);

--
-- Name: export_logs export_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.export_logs
    ADD CONSTRAINT export_logs_pkey PRIMARY KEY (id);

--
-- Name: favorite_products favorite_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorite_products
    ADD CONSTRAINT favorite_products_pkey PRIMARY KEY (id);

--
-- Name: headphones headphones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.headphones
    ADD CONSTRAINT headphones_pkey PRIMARY KEY (id);

--
-- Name: import_log_items import_log_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.import_log_items
    ADD CONSTRAINT import_log_items_pkey PRIMARY KEY (id);

--
-- Name: import_logs import_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.import_logs
    ADD CONSTRAINT import_logs_pkey PRIMARY KEY (id);

--
-- Name: invoices invoices_order_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_order_id_key UNIQUE (order_id);

--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);

--
-- Name: laptops laptops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laptops
    ADD CONSTRAINT laptops_pkey PRIMARY KEY (id);

--
-- Name: login_logs login_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login_logs
    ADD CONSTRAINT login_logs_pkey PRIMARY KEY (id);

--
-- Name: managers managers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.managers
    ADD CONSTRAINT managers_pkey PRIMARY KEY (id);

--
-- Name: membership_benefits membership_benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_benefits
    ADD CONSTRAINT membership_benefits_pkey PRIMARY KEY (id);

--
-- Name: memberships memberships_benefit_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_benefit_id_key UNIQUE (benefit_id);

--
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);

--
-- Name: monitors monitors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monitors
    ADD CONSTRAINT monitors_pkey PRIMARY KEY (id);

--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);

--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);

--
-- Name: payment_logs payment_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_logs
    ADD CONSTRAINT payment_logs_pkey PRIMARY KEY (id);

--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);

--
-- Name: phones phones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phones
    ADD CONSTRAINT phones_pkey PRIMARY KEY (id);

--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);

--
-- Name: product_serials product_serials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_serials
    ADD CONSTRAINT product_serials_pkey PRIMARY KEY (id);

--
-- Name: product_serials product_serials_serial_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_serials
    ADD CONSTRAINT product_serials_serial_number_key UNIQUE (serial_number);

--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);

--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);

--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);

--
-- Name: receipts receipts_export_log_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_export_log_id_key UNIQUE (export_log_id);

--
-- Name: receipts receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_pkey PRIMARY KEY (id);

--
-- Name: recommendation_experiment_log recommendation_experiment_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_experiment_log
    ADD CONSTRAINT recommendation_experiment_log_pkey PRIMARY KEY (id);

--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);

--
-- Name: smartwatches smartwatches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.smartwatches
    ADD CONSTRAINT smartwatches_pkey PRIMARY KEY (id);

--
-- Name: staffs staffs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffs
    ADD CONSTRAINT staffs_pkey PRIMARY KEY (id);

--
-- Name: staffs staffs_staff_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffs
    ADD CONSTRAINT staffs_staff_code_key UNIQUE (staff_code);

--
-- Name: store_settings store_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_settings
    ADD CONSTRAINT store_settings_pkey PRIMARY KEY (id);

--
-- Name: suppliers suppliers_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_name_key UNIQUE (name);

--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);

--
-- Name: supply_order_items supply_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_order_items
    ADD CONSTRAINT supply_order_items_pkey PRIMARY KEY (id);

--
-- Name: supply_orders supply_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_orders
    ADD CONSTRAINT supply_orders_pkey PRIMARY KEY (id);

--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);

--
-- Name: accounts uk_accounts_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT uk_accounts_email UNIQUE (email);

--
-- Name: coupons uk_coupons_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT uk_coupons_code UNIQUE (code);

--
-- Name: customer_coupons uk_customer_coupon; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_coupons
    ADD CONSTRAINT uk_customer_coupon UNIQUE (customer_id, coupon_id);

--
-- Name: favorite_products uk_favorite_products_customer_product_variant; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorite_products
    ADD CONSTRAINT uk_favorite_products_customer_product_variant UNIQUE (customer_id, product_variant_id);

--
-- Name: memberships uk_memberships_tier; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT uk_memberships_tier UNIQUE (tier);

--
-- Name: promotions uk_promotions_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT uk_promotions_code UNIQUE (code);

--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

--
-- Name: addresses fk1fa36y2oqhao3wgg2rw1pi459; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT fk1fa36y2oqhao3wgg2rw1pi459 FOREIGN KEY (user_id) REFERENCES public.users(id);

--
-- Name: monitors fk1o9yvyptvs6yoa9m24sy4i0o4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monitors
    ADD CONSTRAINT fk1o9yvyptvs6yoa9m24sy4i0o4 FOREIGN KEY (id) REFERENCES public.products(id);

--
-- Name: payment_logs fk29ygux4a0q924wl7gs0h7l99g; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_logs
    ADD CONSTRAINT fk29ygux4a0q924wl7gs0h7l99g FOREIGN KEY (order_id) REFERENCES public.orders(id);

--
-- Name: cart_item_bundle_services fk3t585kwojlacboxwd0px1fc8v; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item_bundle_services
    ADD CONSTRAINT fk3t585kwojlacboxwd0px1fc8v FOREIGN KEY (bundle_service_id) REFERENCES public.bundle_services(id);

--
-- Name: favorite_products fk45ettyo1mpwr769wk47cdxhl4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorite_products
    ADD CONSTRAINT fk45ettyo1mpwr769wk47cdxhl4 FOREIGN KEY (customer_id) REFERENCES public.customers(id);

--
-- Name: invoices fk4ko3y00tkkk2ya3p6wnefjj2f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT fk4ko3y00tkkk2ya3p6wnefjj2f FOREIGN KEY (order_id) REFERENCES public.orders(id);

--
-- Name: receipts fk4riagxynetvo7t2tv9qxqsk9w; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT fk4riagxynetvo7t2tv9qxqsk9w FOREIGN KEY (export_log_id) REFERENCES public.export_logs(id);

--
-- Name: supply_orders fk5i5oe7rcphyrbd7kmv0gh7p9a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_orders
    ADD CONSTRAINT fk5i5oe7rcphyrbd7kmv0gh7p9a FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);

--
-- Name: product_promotions fk5li9b7on7wrh01p4ikflvjvx6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_promotions
    ADD CONSTRAINT fk5li9b7on7wrh01p4ikflvjvx6 FOREIGN KEY (product_id) REFERENCES public.products(id);

--
-- Name: cart_item_bundle_services fk5tjgm95vsh3a2lsbhpllxmh9u; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item_bundle_services
    ADD CONSTRAINT fk5tjgm95vsh3a2lsbhpllxmh9u FOREIGN KEY (cart_item_id) REFERENCES public.cart_items(id);

--
-- Name: reviews fk7qpkv66dxpmph7fcilu9ucqtc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk7qpkv66dxpmph7fcilu9ucqtc FOREIGN KEY (parent_id) REFERENCES public.reviews(id);

--
-- Name: carts fk8ba3sryid5k8a9kidpkvqipyt; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT fk8ba3sryid5k8a9kidpkvqipyt FOREIGN KEY (customer_id) REFERENCES public.customers(id);

--
-- Name: smartwatches fk8ubh1rqm4daw6mqwxcft2u79m; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.smartwatches
    ADD CONSTRAINT fk8ubh1rqm4daw6mqwxcft2u79m FOREIGN KEY (id) REFERENCES public.products(id);

--
-- Name: orders fk9p0hwbmw3oxj0kdpb8f1dfsr5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk9p0hwbmw3oxj0kdpb8f1dfsr5 FOREIGN KEY (selected_payment_method_id) REFERENCES public.payment_methods(id);

--
-- Name: customers fka05wbib8rj9goai658v5g7ce4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT fka05wbib8rj9goai658v5g7ce4 FOREIGN KEY (membership_id) REFERENCES public.memberships(id);

--
-- Name: products fka3a4mpsfdf4d2y6r8ra3sc8mv; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fka3a4mpsfdf4d2y6r8ra3sc8mv FOREIGN KEY (brand_id) REFERENCES public.brands(id);

--
-- Name: favorite_products fkabyewuy5ayp1e7lky979l3bs6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorite_products
    ADD CONSTRAINT fkabyewuy5ayp1e7lky979l3bs6 FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);

--
-- Name: product_serials fkb3aua317tcxe9s47weecqtn77; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_serials
    ADD CONSTRAINT fkb3aua317tcxe9s47weecqtn77 FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);

--
-- Name: promotion_target_tiers fkbdf7cdbkm7xtmr3kjv15ma2eu; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_target_tiers
    ADD CONSTRAINT fkbdf7cdbkm7xtmr3kjv15ma2eu FOREIGN KEY (promotion_id) REFERENCES public.promotions(id);

--
-- Name: order_items fkbioxgbv59vetrxe0ejfubep1w; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fkbioxgbv59vetrxe0ejfubep1w FOREIGN KEY (order_id) REFERENCES public.orders(id);

--
-- Name: support_tickets fkbj61s5pm6gwms5405fcdvgm1t; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT fkbj61s5pm6gwms5405fcdvgm1t FOREIGN KEY (customer_id) REFERENCES public.customers(id);

--
-- Name: laptops fkc2vxqdy4uk247x24e5xoyq3jl; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laptops
    ADD CONSTRAINT fkc2vxqdy4uk247x24e5xoyq3jl FOREIGN KEY (id) REFERENCES public.products(id);

--
-- Name: customer_coupons fkc85sxaysivd1ufxu7a8q1oyki; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_coupons
    ADD CONSTRAINT fkc85sxaysivd1ufxu7a8q1oyki FOREIGN KEY (coupon_id) REFERENCES public.coupons(id);

--
-- Name: notifications fkc94cts1ygm7394xj40x1yov1k; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fkc94cts1ygm7394xj40x1yov1k FOREIGN KEY (customer_id) REFERENCES public.users(id);

--
-- Name: reviews fkcgy7qjc1r99dp117y9en6lxye; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fkcgy7qjc1r99dp117y9en6lxye FOREIGN KEY (user_id) REFERENCES public.users(id);

--
-- Name: order_item_bundle_services fkd9uwye7i79ymyv9i7o0y8a9g0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item_bundle_services
    ADD CONSTRAINT fkd9uwye7i79ymyv9i7o0y8a9g0 FOREIGN KEY (order_item_id) REFERENCES public.order_items(id);

--
-- Name: staffs fkdrcbb0t4jyjslw24sf1tkfk2p; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffs
    ADD CONSTRAINT fkdrcbb0t4jyjslw24sf1tkfk2p FOREIGN KEY (id) REFERENCES public.users(id);

--
-- Name: import_log_items fkeyvvme4kvf618rhbbkmgfy83q; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.import_log_items
    ADD CONSTRAINT fkeyvvme4kvf618rhbbkmgfy83q FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);

--
-- Name: export_log_items fkfrkkwueenkqr6a9gwdhosjkmv; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.export_log_items
    ADD CONSTRAINT fkfrkkwueenkqr6a9gwdhosjkmv FOREIGN KEY (export_log_id) REFERENCES public.export_logs(id);

--
-- Name: memberships fkg5el0m85hil6ht13udpiiciys; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT fkg5el0m85hil6ht13udpiiciys FOREIGN KEY (benefit_id) REFERENCES public.membership_benefits(id);

--
-- Name: export_log_items fkgrepohyv6beoy3yqn5q7wf1w1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.export_log_items
    ADD CONSTRAINT fkgrepohyv6beoy3yqn5q7wf1w1 FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);

--
-- Name: orders fkhlglkvf5i60dv6dn397ethgpt; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fkhlglkvf5i60dv6dn397ethgpt FOREIGN KEY (address_id) REFERENCES public.addresses(id);

--
-- Name: customer_coupons fki6seta4h8opvply2e9hxs674m; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_coupons
    ADD CONSTRAINT fki6seta4h8opvply2e9hxs674m FOREIGN KEY (customer_id) REFERENCES public.customers(id);

--
-- Name: notifications fkiw47pt4gy5y5ehe4604fqheas; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fkiw47pt4gy5y5ehe4604fqheas FOREIGN KEY (favorite_product_id) REFERENCES public.favorite_products(id);

--
-- Name: phones fkiye801tdn46usw19faql16lqk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phones
    ADD CONSTRAINT fkiye801tdn46usw19faql16lqk FOREIGN KEY (id) REFERENCES public.products(id);

--
-- Name: supply_order_items fkj25fry47gkk8ipdkiknpy41so; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_order_items
    ADD CONSTRAINT fkj25fry47gkk8ipdkiknpy41so FOREIGN KEY (supply_order_id) REFERENCES public.supply_orders(id);

--
-- Name: order_items fkltmtlue0wixrg1cf0xo7x0l4d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fkltmtlue0wixrg1cf0xo7x0l4d FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);

--
-- Name: customer_notes fkmlqmw0fgfmurvcmhkeqtdq7qs; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT fkmlqmw0fgfmurvcmhkeqtdq7qs FOREIGN KEY (customer_id) REFERENCES public.customers(id);

--
-- Name: notification_channels fkmpsidir1onjqphb9jl5a0ie2s; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_channels
    ADD CONSTRAINT fkmpsidir1onjqphb9jl5a0ie2s FOREIGN KEY (notification_id) REFERENCES public.notifications(id);

--
-- Name: cart_items fkn1s4l7h0vm4o259wpu7ft0y2y; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fkn1s4l7h0vm4o259wpu7ft0y2y FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);

--
-- Name: accounts fknjuop33mo69pd79ctplkck40n; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT fknjuop33mo69pd79ctplkck40n FOREIGN KEY (user_id) REFERENCES public.users(id);

--
-- Name: managers fko602exy2392s7gi9as93mio60; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.managers
    ADD CONSTRAINT fko602exy2392s7gi9as93mio60 FOREIGN KEY (id) REFERENCES public.users(id);

--
-- Name: login_logs fkofjfbi0tlitaqkibvevc0w8sm; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login_logs
    ADD CONSTRAINT fkofjfbi0tlitaqkibvevc0w8sm FOREIGN KEY (account_id) REFERENCES public.accounts(id);

--
-- Name: products fkog2rp4qthbtt2lfyhfo32lsw9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fkog2rp4qthbtt2lfyhfo32lsw9 FOREIGN KEY (category_id) REFERENCES public.categories(id);

--
-- Name: product_variants fkosqitn4s405cynmhb87lkvuau; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT fkosqitn4s405cynmhb87lkvuau FOREIGN KEY (product_id) REFERENCES public.products(id);

--
-- Name: cart_items fkpcttvuq4mxppo8sxggjtn5i2c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fkpcttvuq4mxppo8sxggjtn5i2c FOREIGN KEY (cart_id) REFERENCES public.carts(id);

--
-- Name: reviews fkpl51cejpw4gy5swfar8br9ngi; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fkpl51cejpw4gy5swfar8br9ngi FOREIGN KEY (product_id) REFERENCES public.products(id);

--
-- Name: customers fkpog72rpahj62h7nod9wwc28if; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT fkpog72rpahj62h7nod9wwc28if FOREIGN KEY (id) REFERENCES public.users(id);

--
-- Name: supply_order_items fkprrhopwtf9fftw9h22fhm861t; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_order_items
    ADD CONSTRAINT fkprrhopwtf9fftw9h22fhm861t FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);

--
-- Name: orders fkpxtb8awmi0dk6smoh2vp1litg; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fkpxtb8awmi0dk6smoh2vp1litg FOREIGN KEY (customer_id) REFERENCES public.customers(id);

--
-- Name: product_promotions fkqmcm2exr3u4h8gxekpru47vqb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_promotions
    ADD CONSTRAINT fkqmcm2exr3u4h8gxekpru47vqb FOREIGN KEY (promotion_id) REFERENCES public.promotions(id);

--
-- Name: product_images fkqnq71xsohugpqwf3c9gxmsuy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT fkqnq71xsohugpqwf3c9gxmsuy FOREIGN KEY (product_id) REFERENCES public.products(id);

--
-- Name: headphones fkqrd3bfeboe7iq1rvm2n3ffn9l; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.headphones
    ADD CONSTRAINT fkqrd3bfeboe7iq1rvm2n3ffn9l FOREIGN KEY (id) REFERENCES public.products(id);

--
-- Name: import_log_items fkr93l6mp8oe1xl7mf9ypb0xxn1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.import_log_items
    ADD CONSTRAINT fkr93l6mp8oe1xl7mf9ypb0xxn1 FOREIGN KEY (import_log_id) REFERENCES public.import_logs(id);

--
-- Name: order_item_bundle_services fks06sgt5fjn3lvp0g0ovy7vale; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item_bundle_services
    ADD CONSTRAINT fks06sgt5fjn3lvp0g0ovy7vale FOREIGN KEY (bundle_service_id) REFERENCES public.bundle_services(id);

--
--

