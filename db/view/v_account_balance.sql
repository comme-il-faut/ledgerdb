DROP VIEW IF EXISTS v_account_balance;

CREATE VIEW v_account_balance
AS
WITH postings AS (
  SELECT account_id, posting_date, amount
  FROM posting_header NATURAL JOIN posting_detail
)
SELECT
  p1.account_id,
  p1.posting_date,
  SUM(p2.amount) AS amount,
  CAST(NULL AS TIMESTAMP) AS reconciled
FROM (SELECT DISTINCT account_id, posting_date FROM postings) p1
JOIN postings p2
  ON p2.account_id = p1.account_id
  AND p2.posting_date <= p1.posting_date
GROUP BY p1.account_id, p1.posting_date
ORDER BY p1.account_id, p1.posting_date
;
