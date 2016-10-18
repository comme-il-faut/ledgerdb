CREATE TABLE account (
  account_id    INTEGER       NOT NULL,
  account_type  CHAR(1)       NOT NULL,
  name          VARCHAR(64)   NOT NULL,
  cash          CHAR(1)       NOT NULL DEFAULT 'N',
  active        CHAR(1)       NOT NULL DEFAULT 'Y',

  CONSTRAINT account_pk PRIMARY KEY (account_id),
  CONSTRAINT account_uq_n UNIQUE (name),
  CONSTRAINT account_fk_at FOREIGN KEY (account_type)
    REFERENCES account_type(account_type),
  CONSTRAINT account_ck_c CHECK (cash in ('Y', 'N')),
  CONSTRAINT account_ck_a CHECK (active in ('Y', 'N'))
);

ALTER TABLE account OWNER TO ledgerdb;
