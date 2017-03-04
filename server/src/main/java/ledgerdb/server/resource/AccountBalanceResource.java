package ledgerdb.server.resource;

import io.dropwizard.auth.Auth;
import java.sql.ResultSet;
import java.sql.Statement;
import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import ledgerdb.server.ResponseFormatter;
import ledgerdb.server.auth.User;
import ledgerdb.server.db.AccountBalance;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;

@Path("balance")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AccountBalanceResource {

    private final SessionFactory sf;
    
    @Inject
    public AccountBalanceResource(SessionFactory sf) {
        this.sf = sf;
    }
    
    @GET
    public String doGet() {
        try (Session s = sf.openSession()) {
            return s.doReturningWork(con -> {
                try (Statement st = con.createStatement()) {
                    ResultSet rs = st.executeQuery(
                            "select * from account_balance ab \n"
                            + "where exists ( \n"
                            + "  select 1 from account \n"
                            + "  where account_id = ab.account_id \n"
                            + "  and account_type in ('A', 'L') \n"
                            + "  and active = 'Y' \n"
                            + ") \n"
                            + "and not exists ( \n"
                            + "  select 1 from account_balance \n"
                            + "  where account_id = ab.account_id \n"
                            + "  and posting_date > ab.posting_date \n"
                            + "  and reconciled is not null \n"
                            + ") \n"
                            + "order by account_id, posting_date"
                    );
                    return ResponseFormatter.format(rs);
                }
            });
        }
    }
    
    @POST
    @Path("reconcile")
    public void doPostReconcile(
            @Auth User user,
            @NotNull @Valid AccountBalance ab) {
        Session s = sf.openSession();
        Transaction tx = null;
        try {
            tx = s.beginTransaction();
            
            AccountBalance ab2 = s.get(AccountBalance.class,
                    new AccountBalance.AccountBalancePK(
                            ab.getAccountId(),
                            ab.getPostingDate()));
            if (ab2 == null)
                throw new NotFoundException();
            if (ab2.getAmount().compareTo(ab.getAmount()) != 0)
                throw new BadRequestException();
            
            ab2.setReconciled(true);
            
            tx.commit();
            tx = null;
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw e;
        } finally {
            s.close();
        }
    }
}
