DROP VIEW IF EXISTS v_statement_in_equity;

CREATE VIEW v_statement_in_equity
AS
SELECT *
FROM statement s
WHERE EXISTS (
  SELECT 1
  FROM posting_header h
  JOIN posting_detail de
    ON de.posting_header_id = h.posting_header_id
    AND de.account_id =
     (SELECT account_id
      FROM account
      WHERE account_type = 'E')
  JOIN posting_detail d
    ON d.posting_header_id = h.posting_header_id
    AND d.account_id <> de.account_id
  WHERE s.account_id = d.account_id
  AND s.statement_date <= h.posting_date
);
