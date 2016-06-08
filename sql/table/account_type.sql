CREATE TABLE account_type (
  account_type  CHAR(1)       NOT NULL,
  mask          INTEGER       NOT NULL,
  description   VARCHAR(32)   NOT NULL,
  sign          SMALLINT      NOT NULL, -- balance multiplier

  CONSTRAINT account_type_pk PRIMARY KEY (account_type),
  CONSTRAINT account_type_uq_m UNIQUE (mask),
  CONSTRAINT account_type_ck_m CHECK (mask > 0 AND mask % 100 = 0),
  CONSTRAINT account_type_ck_s CHECK (sign in (1, -1))
);

ALTER TABLE account_type OWNER TO ledgerdb;
