CREATE TABLE account_balance (
  account_id    INTEGER       NOT NULL,
  posting_date  DATE          NOT NULL,
  amount        DECIMAL(12,2) NOT NULL, -- sum(debits)-sum(credits)
  reconciled    TIMESTAMP,

  CONSTRAINT account_balance_pk PRIMARY KEY (account_id, posting_date),
  CONSTRAINT account_balance_fk_a FOREIGN KEY (account_id)
    REFERENCES account(account_id)
);

ALTER TABLE account_balance OWNER TO ledgerdb;
