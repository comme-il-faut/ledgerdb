drop view if exists account_balance_view;
create view account_balance_view
as
with postings as (
  select account_id, posting_date, amount
  from posting_header natural join posting_detail
)
select
  p1.account_id,
  (select name from account where account_id = p1.account_id) as account_name,
  p1.posting_date,
  sum(p2.amount) as amount,
  sum(case when p1.posting_date = p2.posting_date then 1 else 0 end) as cnt
from (select distinct account_id, posting_date from postings) p1
join postings p2
  on p2.account_id = p1.account_id
  and p2.posting_date <= p1.posting_date
group by p1.account_id, p1.posting_date
order by p1.account_id, p1.posting_date
;
