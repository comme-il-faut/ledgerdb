DROP VIEW IF EXISTS v_account_balance2;

CREATE VIEW v_account_balance2
AS
WITH postings AS (
  SELECT account_id, posting_date, amount
  FROM posting_header NATURAL JOIN posting_detail
)
SELECT
  p1.account_id,
  (SELECT name FROM account where account_id = p1.account_id) AS account_name,
  p1.posting_date,
  SUM(p2.amount) AS amount,
  SUM(CASE WHEN p1.posting_date = p2.posting_date THEN 1 ELSE 0 END) AS cnt
FROM (SELECT DISTINCT account_id, posting_date FROM postings) p1
JOIN postings p2
  ON p2.account_id = p1.account_id
  AND p2.posting_date <= p1.posting_date
WHERE EXISTS (
  SELECT NULL FROM account
  WHERE account_id = p1.account_id
  AND account_type IN ('A', 'L')
)
GROUP BY p1.account_id, p1.posting_date
ORDER BY p1.account_id, p1.posting_date
;
