DROP VIEW IF EXISTS v_posting;

CREATE VIEW v_posting
AS
SELECT
  h.posting_header_id,
  d.posting_detail_id,

  h.posting_date,
  h.accountable_user_id,
  h.description,

  d.account_id,
  d.amount,
  d.statement_id

FROM posting_header h
NATURAL JOIN posting_detail d
;
