DROP VIEW IF EXISTS v_check_statement_posted;

CREATE VIEW v_check_statement_posted
AS
SELECT
  s.statement_id,
  pd.posting_detail_id,
  pd.posting_header_id,
  pd.account_id AS posting_account_id,
  s.account_id AS statement_account_id,
  pd.amount AS posting_amount,
  s.amount AS statement_amount,
  s.posted
FROM posting_detail pd
FULL OUTER JOIN statement s
  ON pd.statement_id = s.statement_id
WHERE (
  (pd.statement_id IS NULL
    AND s.posted = 'Y')
  OR (
    pd.statement_id IS NOT NULL
    AND (
      s.posted = 'N'
      OR s.account_id <> pd.account_id
      OR s.amount <> pd.amount
    )
  )
);
