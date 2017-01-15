drop view if exists statement_check_posted_consistency;
create view statement_check_posted_consistency
as
select
  pd.posting_detail_id,
  pd.posting_header_id,
  pd.account_id as posting_account_id,
  s.account_id as statement_account_id,
  pd.amount as posting_amount,
  s.amount as statement_amount,
  s.posted
from posting_detail pd
full outer join statement s
  on pd.statement_id = s.statement_id
where (
  (pd.statement_id is null
    and s.posted = 'Y')
  or (
    pd.statement_id is not null
    and (
      s.posted = 'N'
      or s.account_id <> pd.account_id
      or s.amount <> pd.amount
    )
  )
);
