CREATE TABLE sys_user (
  user_id       SERIAL,
  user_name     VARCHAR(32) NOT NULL,
  full_name     VARCHAR(128) NOT NULL,

  CONSTRAINT sys_user_pk PRIMARY KEY (user_id),
  CONSTRAINT sys_user_uq_un UNIQUE (user_name)
);

ALTER TABLE sys_user OWNER TO ledgerdb;
