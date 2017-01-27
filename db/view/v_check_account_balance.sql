DROP VIEW IF EXISTS v_check_account_balance;

CREATE VIEW v_check_account_balance
AS
SELECT
  COALESCE(a.account_id, v.account_id) AS acount_id,
  COALESCE(a.posting_date, v.posting_date) AS posting_date,
  a.amount AS amount_per_balance,
  v.amount AS amount_per_posting,
  a.reconciled
FROM account_balance a
FULL OUTER JOIN v_account_balance v
  ON a.account_id = v.account_id
  AND a.posting_date = v.posting_date
WHERE a.amount IS NULL
OR v.amount IS NULL
OR v.amount != a.amount
;
