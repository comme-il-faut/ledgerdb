CREATE TABLE statement (
  statement_id    SERIAL,
  statement_date  DATE          NOT NULL,
  account_id      INTEGER       NOT NULL,
  amount          DECIMAL(12,2) NOT NULL, -- debit positive, credit negative
  description     VARCHAR(128),
  posted          CHAR(1)       NOT NULL DEFAULT 'N',

  CONSTRAINT statement_pk PRIMARY KEY (statement_id),
  CONSTRAINT statement_fk_a FOREIGN KEY (account_id)
    REFERENCES account(account_id),
  CONSTRAINT statement_ck_a CHECK (amount <> 0),
  CONSTRAINT statement_ck_p CHECK (posted IN ('Y', 'N'))
  --TODO: index on account_id?
);

ALTER TABLE statement OWNER TO ledgerdb;
