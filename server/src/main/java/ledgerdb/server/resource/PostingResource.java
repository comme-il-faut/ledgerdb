package ledgerdb.server.resource;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.dropwizard.auth.Auth;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashSet;
import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import ledgerdb.server.AppException;
import ledgerdb.server.ResponseFormatter;
import ledgerdb.server.auth.User;
import ledgerdb.server.db.AccountBalance;
import ledgerdb.server.db.PostingDetail;
import ledgerdb.server.db.PostingHeader;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path("/posting")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
public class PostingResource {
    
    private static final Logger logger = LoggerFactory.getLogger(PostingResource.class);

    private final SessionFactory sf;
    
    @Inject
    public PostingResource(SessionFactory sf) {
        this.sf = sf;
    }
    
    @GET
    public String doGet() throws SQLException, JsonProcessingException {
        try (Session s = sf.openSession()) {
            return s.doReturningWork(con -> {
                try (Statement st = con.createStatement()) {
                    ResultSet rs = st.executeQuery(
                        "select \n"
                        + "  s.*, \n"
                        + "  a.name as account_name \n"
                        + "from ( \n"
                        + "  select * \n"
                        + "  from posting_header \n"
                        + "  natural join posting_detail \n"
                        + ") s \n"
                        + "join account a \n"
                        + "  on a.account_id = s.account_id \n"
                        + "order by \n"
                        + "  posting_header_id desc, \n"
                        + "  sign(amount) desc, \n" // debit/positive first, then credit/negative
                        + "  posting_detail_id \n"
                    );
                    return ResponseFormatter.format(rs);
                }
            });
        }
    }
    
    @POST
    public PostingHeader doPost(
            @Auth User user,
            @NotNull @Valid PostingHeader ph) {
        Session s = sf.openSession();
        Transaction tx = null;
        try {
            tx = s.beginTransaction();
            
            postPostings(ph, s);
            
            tx.commit();
            tx = null;
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw e;
        } finally {
            s.close();
        }
        return ph;
    }
    
    void postPostings(PostingHeader ph, Session s) {
        if (ph.getPostingDetails().isEmpty())
            throw new BadRequestException();
        BigDecimal total = ph.getPostingDetails()
                .stream()
                .map(pd -> pd.getAmount())
                .reduce((a, b) -> a.add(b))
                .get();
        if (total.compareTo(BigDecimal.ZERO) != 0)
            throw new BadRequestException("Unbalanced posting with non zero total " + total);
        
        if (!ph.getPostingDetails()
                .stream()
                .map(pd -> pd.getAccountId())
                .allMatch(new HashSet<>()::add)) {
            throw new BadRequestException("Accounts must be unique within a single posting");
        }
        
        for (PostingDetail pd : ph.getPostingDetails()) {
            if (pd.getPostingHeader() == null)
                pd.setPostingHeader(ph);
            else if (pd.getPostingHeader() != ph)
                throw new BadRequestException();
        }
        
        // check account balances are not closed (i.e., not reconciled)
        long count = (Long)s.createCriteria(AccountBalance.class)
                .add(Restrictions.or(
                        ph.getPostingDetails().stream().map(
                                pd -> Restrictions.and(
                                        Restrictions.eq("accountId", pd.getAccountId()),
                                        Restrictions.ge("postingDate", ph.getPostingDate()),
                                        Restrictions.isNotNull("reconciled")
                                )
                        ).toArray(Criterion[]::new)
                ))
                .setProjection(Projections.rowCount())
                .uniqueResult();
        if (count > 0) {
            throw new BadRequestException("Can't post to account with balance marked as reconciled");
        }

        s.persist(ph);
        s.flush();
        
        // update statement(s)
        
        Query q1 = s.createQuery(
                "update Statement"
                + " set posted = true"
                + " where id = :id"
                + " and accountId = :accountId"
                + " and posted = false"
        );
        for (PostingDetail pd : ph.getPostingDetails()) {
            if (pd.getStatementId() != null) {
                q1.setParameter("id", pd.getStatementId());
                q1.setParameter("accountId", pd.getAccountId());
                count = q1.executeUpdate();
                if (count != 1)
                    throw new BadRequestException(
                            "Failed to link posting detail to statement id " +
                                    pd.getStatementId());
            }
        }
        
        // update account balances
        
        Query q2 = s.createQuery(
                "select a from AccountBalance a"
                + " where accountId = :accountId"
                + " and postingDate ="
                + "  (select max(postingDate) from AccountBalance"
                + "   where accountId = :accountId"
                + "   and postingDate <= :postingDate)"
        );
        Query q3 = s.createQuery(
                "update AccountBalance"
                + " set amount = amount + :amount, reconciled = null"
                + " where accountId = :accountId"
                + " and postingDate >= :postingDate"
        );
        ph.getPostingDetails().forEach(pd -> {
            q2.setParameter("accountId", pd.getAccountId());
            q2.setParameter("postingDate", ph.getPostingDate());
            AccountBalance ab = (AccountBalance)q2.uniqueResult();
            if (ab == null || !ab.getPostingDate().equals(ph.getPostingDate())) {
                AccountBalance ab2 = new AccountBalance();
                ab2.setAccountId(pd.getAccountId());
                ab2.setPostingDate(ph.getPostingDate());
                ab2.setAmount(ab != null ? ab.getAmount() : BigDecimal.ZERO);
                s.persist(ab2);
                s.flush();
            }
            
            q3.setParameter("accountId", pd.getAccountId());
            q3.setParameter("postingDate", ph.getPostingDate());
            q3.setParameter("amount", pd.getAmount());
            q3.executeUpdate();
            s.flush();
        });
    }
    
    @DELETE
    public void doDelete(PostingHeader[] phs) {
        Session session = sf.openSession();
        Transaction tx = null;
        try {
            tx = session.beginTransaction();
            
            Query q1 = session.createQuery("delete from PostingDetail where postingHeader.id = :id");
            Query q2 = session.createQuery("delete from PostingHeader where id = :id");
            
            for (PostingHeader ph : phs) {
                int id = ph.getId();
                //ph = session.get(PostingHeader.class, id);
                //if (ph == null)
                //    throw new AppException("No such posting header id: " + id);
                
                q1.setInteger("id", id);
                q2.setInteger("id", id);
                
                q1.executeUpdate();
                q2.executeUpdate();
            }
            
            tx.commit();
            tx = null;
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw e;
        } finally {
            session.close();
        }
    }
    
    @GET
    @Path("flows")
    public String doGetFlows(
            @QueryParam("d1") String d1,
            @QueryParam("d2") String d2) {
        
        if (d1 != null && !d1.matches("^\\d{4}-\\d{2}-\\d{2}$"))
            throw new BadRequestException();
        if (d2 != null && !d2.matches("^\\d{4}-\\d{2}-\\d{2}$"))
            throw new BadRequestException();
        
        StringBuilder where = new StringBuilder();
        if (d1 != null) {
            where.append("  and h.posting_date >= '")
                    .append(d1)
                    .append("'")
                    .append(" \n");
        }
        if (d2 != null) {
            where.append("  and h.posting_date <= '")
                    .append(d2)
                    .append("'")
                    .append(" \n");
        }
        
        String sql
                = "with ph as ( \n"
                + "  select \n"
                + "    h.posting_header_id, \n"
                + "    h.posting_date, \n"
                + "    sum(d.amount) as amount \n"
                + "  from posting_header h \n"
                + "  natural join posting_detail d \n"
                + "  where d.amount < 0 \n"
                + where.toString()
                + "  group by \n"
                + "    h.posting_header_id, \n"
                + "    h.posting_date \n"
                + ") \n"
                + "select \n"
                //+ "  to_char(ph.posting_date, 'YYYY-MM') as posting_month, \n"
                + "  p1.account_id as account_1, \n"
                + "  p2.account_id as account_2, \n"
                + "  sum(round((p1.amount * (p2.amount / ph.amount)), 2)) as amount, \n"
                + "  min(ph.posting_date) as min_date, \n"
                + "  max(ph.posting_date) as max_date \n"
                + "from ph \n"
                + "join posting_detail p1 \n"
                + "  on p1.posting_header_id = ph.posting_header_id \n"
                + "  and p1.amount < 0 \n"
                + "join posting_detail p2 \n"
                + "  on p2.posting_header_id = ph.posting_header_id \n"
                + "  and p2.amount > 0 \n"
                + "where not exists \n"
                + " (select null from account \n"
                + "  where account_id in (p1.account_id, p2.account_id) \n"
                + "  and (account_type = 'E' or account_id = 1110)) \n"
                + "group by \n"
                //+ "  to_char(ph.posting_date, 'YYYY-MM'), \n"
                + "  p1.account_id, \n"
                + "  p2.account_id \n"
                + "order by \n"
                //+ "  to_char(ph.posting_date, 'YYYY-MM'), \n"
                + "  p1.account_id, \n"
                + "  p2.account_id \n";
        
        try (Session s = sf.openSession()) {
            return s.doReturningWork(con -> {
                try (Statement st = con.createStatement()) {
                    ResultSet rs = st.executeQuery(sql);
                    return ResponseFormatter.format(rs);
                }
            });
        }
    }
}