CREATE TABLE posting_header (
  posting_header_id SERIAL,
  posting_date      DATE NOT NULL,
  description       VARCHAR(128),

  CONSTRAINT posting_header_pk PRIMARY KEY (posting_header_id)
);

ALTER TABLE posting_header OWNER TO ledgerdb;
