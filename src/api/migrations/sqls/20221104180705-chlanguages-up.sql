/* Replace with your SQL commands */

-- DROP TABLE IF EXISTS public.constellation_health_language;

CREATE TABLE IF NOT EXISTS public.constellation_health_language
(
    id bigint NOT NULL,
    value character varying(100) COLLATE pg_catalog."default" NOT NULL,
    description character varying(500) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT language_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.constellation_health_language
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.constellation_health_language_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.constellation_health_language_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY constellation_health_language.id;

ALTER SEQUENCE public.constellation_health_language_id_seq
    OWNER TO postgres;