-- ProductRepository.searchProductIdsByKeyword relies on this column, but it was previously
-- added directly on the production database outside of Flyway (schema drift) — any fresh
-- environment (new dev machine, Staging, Testcontainers-based integration tests) was missing
-- it entirely, so keyword search failed with "column search_vector does not exist" everywhere
-- except production. IF NOT EXISTS makes this a no-op on production (column/index already
-- there) while creating it correctly on every other environment.

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', COALESCE(name, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(description, '')), 'B')
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_products_search_vector ON public.products USING gin (search_vector);
