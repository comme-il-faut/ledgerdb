CREATE TABLE institution_link (
  account_id  INTEGER     NOT NULL,
  institution VARCHAR(32) NOT NULL,
  reference   VARCHAR(32) NOT NULL, -- account # at financial institution

  CONSTRAINT institution_link_pk PRIMARY KEY (account_id),
  CONSTRAINT institution_link_fk_a FOREIGN KEY (account_id)
    REFERENCES account(account_id),
  CONSTRAINT institution_link_ck_r CHECK (reference ~ E'^\\d+$'),
  CONSTRAINT institution_link_uq_ir UNIQUE (institution, reference)
);

ALTER TABLE institution_link OWNER TO ledgerdb;
