drop view if exists statement_in_equity_view;
create view statement_in_equity_view
as
select *
from statement s
where exists (
  select 1
  from posting_header h
  join posting_detail de
    on de.posting_header_id = h.posting_header_id
    and de.account_id =
     (select account_id
      from account
      where account_type = 'E')
  join posting_detail d
    on d.posting_header_id = h.posting_header_id
    and d.account_id <> de.account_id
  where s.account_id = d.account_id
  and s.statement_date <= h.posting_date
);
