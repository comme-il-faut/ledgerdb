package ledgerdb.server.resource;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.dropwizard.auth.Auth;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
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
    public String get() throws SQLException, JsonProcessingException {
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
    public PostingHeader post(
            @Auth User user,
            @NotNull @Valid PostingHeader ph) {
        Session s = sf.openSession();
        Transaction tx = null;
        try {
            tx = s.beginTransaction();
            
            post2(ph, s);
            
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
    
    void post2(PostingHeader ph, Session s) {
        if (ph.getPostingDetails().isEmpty())
            throw new BadRequestException();
        BigDecimal total = ph.getPostingDetails()
                .stream()
                .map(pd -> pd.getAmount())
                .reduce((a, b) -> a.add(b))
                .get();
        if (total.compareTo(BigDecimal.ZERO) != 0)
            throw new BadRequestException("Invalid unbalanced posting with " + total + " total.");
        
        for (PostingDetail pd : ph.getPostingDetails()) {
            if (pd.getPostingHeader() == null)
                pd.setPostingHeader(ph);
            else if (pd.getPostingHeader() != ph)
                throw new BadRequestException();
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
                int count = q1.executeUpdate();
                if (count != 1)
                    throw new BadRequestException(
                            "Failed to link posting detail to statement id " +
                                    pd.getStatementId());
            }
        }
        
        // update account balances
        
        Query q2 = s.createQuery(
                "update AccountBalance"
                + " set amount = amount + :amount"
                + " where accountId = :accountId"
                + " and postingDate = :postingDate"
        );
        Query q3 = s.createQuery(
                "select amount from AccountBalance "
                + " where accountId = :accountId"
                + " and postingDate ="
                + "  (select max(postingDate) from AccountBalance"
                + "   where accountId = :accountId"
                + "   and postingDate <= :postingDate)"
        );
        ph.getPostingDetails().forEach(pd -> {
            // update account balance
            q2.setParameter("postingDate", ph.getPostingDate());
            q2.setParameter("accountId", pd.getAccountId());
            q2.setParameter("amount", pd.getAmount());
            int count = q2.executeUpdate();
            if (count == 0) {
                // insert into account balance
                q3.setParameter("postingDate", ph.getPostingDate());
                q3.setParameter("accountId", pd.getAccountId());

                BigDecimal amount = (BigDecimal)q3.uniqueResult();
                if (amount == null)
                    amount = BigDecimal.ZERO;
                amount = amount.add(pd.getAmount());

                AccountBalance ab = new AccountBalance();
                ab.setAccountId(pd.getAccountId());
                ab.setPostingDate(ph.getPostingDate());
                ab.setAmount(amount);
                s.persist(ab);
            }
        });
    }
    
    @DELETE
    public void delete(PostingHeader[] phs) {
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
}
