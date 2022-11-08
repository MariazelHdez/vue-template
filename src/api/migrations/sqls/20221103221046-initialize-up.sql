/* Replace with your SQL commands */

-- Table: public.test

-- DROP TABLE IF EXISTS public.test;

CREATE TABLE IF NOT EXISTS public.test
(
    id bigint NOT NULL,
    columna character varying(250) COLLATE pg_catalog."default",
    CONSTRAINT test_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.test
    OWNER to postgres;