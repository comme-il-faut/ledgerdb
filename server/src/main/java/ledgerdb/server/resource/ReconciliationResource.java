package ledgerdb.server.resource;

import java.sql.ResultSet;
import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.container.ResourceContext;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import ledgerdb.server.ResponseFormatter;
import org.hibernate.Session;
import org.hibernate.SessionFactory;

@Path("/reconciliation")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
public class ReconciliationResource {

    private final SessionFactory sf;
    
    @Context
    private ResourceContext rc;
    
    @Inject
    public ReconciliationResource(SessionFactory sf) {
        this.sf = sf;
    }
    
    @GET
    public String get() {
        try (Session s = sf.openSession()) {
            String postings = s.doReturningWork(con -> {
                try (java.sql.Statement st = con.createStatement()) {
                    ResultSet rs = st.executeQuery(
                        "select * \n"
                        + "from posting_header ph \n"
                        + "natural join posting_detail pd \n"
                        + "where statement_id is null \n"
                        + "and exists \n"
                        + " (select 1 from institution_link il \n"
                        + "  where il.account_id = pd.account_id \n"
                        + "  and exists \n"
                        + "   (select 1 from account \n"
                        + "    where active = 'Y' \n"
                        + "    and account_id = il.account_id)) \n"
                        + "and not exists \n"
                        + " (select 1 from posting_detail pd2 \n"
                        + "  where pd2.posting_header_id = ph.posting_header_id \n"
                        + "  and exists \n"
                        + "   (select 1 from account \n"
                        + "    where active = 'Y' \n"
                        + "    and account_type = 'E' \n"
                        + "    and account_id = pd2.account_id)) \n"
                        + "order by posting_header_id, posting_detail_id \n"
                    );
                    return ResponseFormatter.format(rs);
                }
            });
            
            String statements = s.doReturningWork(con -> {
                try (java.sql.Statement st = con.createStatement()) {
                    ResultSet rs = st.executeQuery(
                        "select * from statement \n"
                        + "where posted = 'N' \n"
                        + "order by statement_id \n"
                    );
                    return ResponseFormatter.format(rs);
                }
            });
            
            String accounts = rc.getResource(AccountResource.class).getAccounts();
            
            return "{\"postings\":" + postings
                    + ",\"statements\":" + statements
                    + ",\"accounts\":" + accounts
                    + "}";
        }
    }

}