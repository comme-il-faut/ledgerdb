package ledgerdb.server.resource;

import io.dropwizard.auth.Auth;
import java.sql.ResultSet;
import java.util.Objects;
import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.container.ResourceContext;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import ledgerdb.server.AppException;
import ledgerdb.server.ResponseFormatter;
import ledgerdb.server.auth.User;
import ledgerdb.server.db.PostingDetail;
import ledgerdb.server.db.PostingHeader;
import ledgerdb.server.db.Statement;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;

@Path("reconciliation")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ReconciliationResource {

    private final SessionFactory sf;
    
    @Context
    private ResourceContext rc;
    
    @Inject
    public ReconciliationResource(SessionFactory sf) {
        this.sf = sf;
    }
    
    @GET
    public String doGet() {
        //if (this != null) throw new NotFoundException();
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
            
            String accounts = rc.getResource(AccountResource.class).doGet();
            String accountTypes = rc.getResource(AccountTypeResource.class).doGet();
            
            return "{\"postings\":" + postings
                    + ",\"statements\":" + statements
                    + ",\"accounts\":" + accounts
                    + ",\"accountTypes\":" + accountTypes
                    + "}";
        }
    }

    @POST
    @Path("p2s")
    public void doPostP2S(
            @Auth User user,
            P2S[] pairs) {
        Session s = sf.openSession();
        Transaction tx = null;
        try {
            tx = s.beginTransaction();
            
            for (P2S pair : pairs) {
                int postingDetailId = pair.postingDetailId;
                int statementId = pair.statementId;
                
                PostingDetail postingDetail = s.get(PostingDetail.class, postingDetailId);
                if (postingDetail == null)
                    throw new AppException("No such posting id: " + postingDetailId);
                
                Statement statement = s.get(Statement.class, statementId);
                if (statement == null)
                    throw new AppException("No such statement id: " + statementId);
                
                if (statement.isPosted())
                    throw new AppException("Statement " + statementId + " is already posted");
                if (postingDetail.getStatementId() != null)
                    throw new AppException("Posting " + postingDetailId + " is already linked"
                            + " with statement " + statementId);
                
                if (postingDetail.getAccountId() != statement.getAccountId())
                    throw new AppException("Posting " + postingDetailId
                            + " and statement " + statementId
                            + " have different accounts and cannot be linked");
                if (!postingDetail.getAmount().equals(statement.getAmount()))
                    throw new AppException("Posting " + postingDetailId
                            + " and statement " + statementId
                            + " have different amounts and cannot be linked");

                statement.reconcile(postingDetail);
            }
            
            tx.commit();
            tx = null;
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw e;
        } finally {
            s.close();
        }
    }
    
    @POST
    @Path("s2s")
    public void doPostS2S(
            @Auth User user,
            S2S[] pairs) {
        PostingResource postingResource = rc.getResource(PostingResource.class);
        
        Session s = sf.openSession();
        Transaction tx = null;
        try {
            tx = s.beginTransaction();
            
            for (S2S pair : pairs) {
                int statementId1 = pair.statementId1;
                int statementId2 = pair.statementId2;
                
                Statement statement1 = s.get(Statement.class, statementId1);
                if (statement1 == null)
                    throw new AppException("No such statement id: " + statementId1);
                Statement statement2 = s.get(Statement.class, statementId2);
                if (statement2 == null)
                    throw new AppException("No such statement id: " + statementId2);
                
                if (statement1.isPosted())
                    throw new AppException("Statement " + statementId1 + " is already posted");
                if (statement2.isPosted())
                    throw new AppException("Statement " + statementId2 + " is already posted");

                if (!(Objects.equals(statement1.getDate(), statement2.getDate())
                        && Objects.equals(
                                statement1.getAmount().negate(),
                                statement2.getAmount())
                        && statement1.getAccountId() != statement2.getAccountId()))
                    throw new AppException("Statement " + statementId1
                            + " and statement " + statementId2
                            + " cannot be paired");

                PostingHeader ph = new PostingHeader();
                ph.setPostingDate(statement2.getDate());
                ph.setDescription(statement2.getDescription());

                PostingDetail pd1 = new PostingDetail();
                pd1.setAccountId(statement1.getAccountId());
                pd1.setAmount(statement1.getAmount());
                pd1.setStatementId(statementId1);
                ph.addPostingDetail(pd1);

                PostingDetail pd2 = new PostingDetail();
                pd2.setAccountId(statement2.getAccountId());
                pd2.setAmount(statement2.getAmount());
                pd2.setStatementId(statementId2);
                ph.addPostingDetail(pd2);

                postingResource.postPostings(ph, s);
            }
                
            tx.commit();
            tx = null;
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw e;
        } finally {
            s.close();
        }
    }
    
    public static class P2S {
        public int postingDetailId;
        public int statementId;
    }
    public static class S2S {
        public int statementId1;
        public int statementId2;
    }
}