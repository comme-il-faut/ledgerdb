DROP VIEW IF EXISTS v_check_account_balance;

CREATE VIEW v_check_account_balance
AS
SELECT
  account_id,
  posting_date,
  amount_per_balance,
  amount_per_posting,
  reconciled
FROM (
  SELECT
    COALESCE(a.account_id, v.account_id) AS account_id,
    COALESCE(a.posting_date, v.posting_date) AS posting_date,
    a.amount AS amount_per_balance,
    COALESCE(v.amount,
      (SELECT amount FROM v_account_balance
       WHERE account_id = COALESCE(a.account_id, v.account_id)
       AND posting_date =
        (SELECT MAX(posting_date) FROM v_account_balance
         WHERE account_id = COALESCE(a.account_id, v.account_id)
         AND posting_date < COALESCE(a.posting_date, v.posting_date))))
      AS amount_per_posting,
    a.reconciled
  FROM account_balance a
  FULL OUTER JOIN v_account_balance v
    ON a.account_id = v.account_id
    AND a.posting_date = v.posting_date
) s
WHERE amount_per_balance IS NULL
OR amount_per_posting IS NULL
OR amount_per_balance != amount_per_posting
ORDER BY 1, 2
;
