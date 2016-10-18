CREATE TABLE sys_activity_log (
  activity_log_id SERIAL,

  object_name     VARCHAR(64) NOT NULL,
  object_data     TEXT NOT NULL,

  user_id         INTEGER NOT NULL,
  action          CHAR(1) NOT NULL,
  ts              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT sys_activity_log_pk PRIMARY KEY (activity_log_id),
  CONSTRAINT sys_activity_log_fk_u FOREIGN KEY (user_id)
    REFERENCES sys_user(user_id),
  CONSTRAINT sys_activity_log_ck_a CHECK (action IN ('I', 'U', 'D'))
);

ALTER TABLE sys_activity_log OWNER TO ledgerdb;
