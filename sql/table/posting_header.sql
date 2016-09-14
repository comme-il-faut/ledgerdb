CREATE TABLE posting_header (
  posting_header_id   SERIAL,
  posting_date        DATE NOT NULL,
  accountable_user_id INTEGER NOT NULL,
  description         VARCHAR(128) NOT NULL,

  CONSTRAINT posting_header_pk PRIMARY KEY (posting_header_id),
  CONSTRAINT posting_header_fk_aui FOREIGN KEY (accountable_user_id)
    REFERENCES sys_user(user_id)
);

ALTER TABLE posting_header OWNER TO ledgerdb;
