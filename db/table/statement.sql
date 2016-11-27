CREATE TABLE statement (
  statement_id      SERIAL,
  statement_date    DATE          NOT NULL,
  account_id        INTEGER       NOT NULL,
  amount            DECIMAL(12,2) NOT NULL, -- debit positive, credit negative
  description       VARCHAR(128) NOT NULL,
  source            VARCHAR(32) NOT NULL,
  posting_detail_id INTEGER,

  CONSTRAINT statement_pk PRIMARY KEY (statement_id),
  CONSTRAINT statement_fk_a FOREIGN KEY (account_id)
    REFERENCES account(account_id),
  CONSTRAINT statement_ck_a CHECK (amount <> 0),
  CONSTRAINT statement_fk_p FOREIGN KEY (posting_detail_id)
    REFERENCES posting_detail(posting_detail_id)
);

ALTER TABLE statement OWNER TO ledgerdb;
