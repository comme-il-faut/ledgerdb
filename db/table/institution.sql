CREATE TABLE institution (
  institution VARCHAR(32)  NOT NULL,
  full_name   VARCHAR(128) NOT NULL,

  CONSTRAINT institution_pk PRIMARY KEY (institution),
  CONSTRAINT institution_uq_fn UNIQUE (full_name),
  CONSTRAINT institution_ck_i CHECK (institution = lower(institution))
);

ALTER TABLE institution OWNER TO ledgerdb;
