CREATE TABLE sys_role (
  role_id       SERIAL,
  role_name     VARCHAR(32) NOT NULL,
  description   VARCHAR(128) NOT NULL,

  CONSTRAINT sys_role_pk PRIMARY KEY (role_id),
  CONSTRAINT sys_role_uq_rn UNIQUE (role_name)
);

ALTER TABLE sys_role OWNER TO ledgerdb;
