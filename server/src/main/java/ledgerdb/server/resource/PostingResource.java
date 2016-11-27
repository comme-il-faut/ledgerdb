package ledgerdb.server.resource;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.dropwizard.auth.Auth;
import java.math.BigDecimal;
import java.math.MathContext;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import ledgerdb.server.JsonUtils;
import ledgerdb.server.auth.User;
import ledgerdb.server.db.PostingHeader;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path("/posting")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
public class PostingResource {
    
    private static final Logger LOG = LoggerFactory.getLogger(PostingResource.class);

    private final SessionFactory sf;
    
    @Inject
    public PostingResource(SessionFactory sf) {
        this.sf = sf;
    }
    
    @GET
    //@Path("/")
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
                    return JsonUtils.format(rs);
                }
            });
        }
    }
    
    @POST
    //@Path("/")
    public PostingHeader post(
            @Auth User user,
            @NotNull @Valid PostingHeader postingHeader) {
        
        if (postingHeader.getPostingDetails().isEmpty())
            throw new BadRequestException();
        BigDecimal total = postingHeader.getPostingDetails()
                .stream()
                .map(pd -> pd.getAmount())
                .reduce((a, b) -> a.add(b))
                .get();
        if (total.compareTo(BigDecimal.ZERO) != 0)
            throw new BadRequestException("Invalid unbalanced posting with " + total + " total.");
        
        postingHeader.getPostingDetails()
                .forEach(pd -> pd.setPostingHeader(postingHeader));
        
        try (Session s = sf.openSession()) {
            Transaction tx = s.beginTransaction();
            s.persist(postingHeader);
            tx.commit();
        }
        return postingHeader;
        
        //LOG.info("posting = {}", posting.toString());
        /*
        try (Connection con = dbConfig.getConnection()) {
            
            //TODO check cr/dr accounts exist
            
            con.setAutoCommit(false);
            try (PreparedStatement st1 = con.prepareStatement(
                        "insert into posting_header " +       
                        "(posting_date, accountable_user_id, description)" +
                        "values (?, ?, ?)",
                        Statement.RETURN_GENERATED_KEYS);
                PreparedStatement st2 = con.prepareStatement(
                        "insert into posting_detail " +       
                        "(posting_header_id, account_id, amount)" +
                        "values (?, ?, ?)",
                        Statement.RETURN_GENERATED_KEYS)
            ) {
                st1.setDate(1, new java.sql.Date(posting.date.getTime()));
                st1.setInt(2, user.getId());
                st1.setString(3, posting.description);
                st1.executeUpdate();
                
                ResultSet rs = st1.getGeneratedKeys();
                if (!rs.next())
                    throw new AppException("Failed to generatate posting_header_pk");
                
                int id = rs.getInt(1);
                
                st2.setInt(1, id);
                st2.setInt(2, posting.cr);
                st2.setBigDecimal(3, posting.amount.negate());
                st2.executeUpdate();
                
                st2.setInt(1, id);
                st2.setInt(2, posting.dr);
                st2.setBigDecimal(3, posting.amount);
                st2.executeUpdate();
                
                con.commit();
            } catch (Exception e) {
                con.rollback();
                throw e;
            } finally {
                con.setAutoCommit(true);
            }
            
        }
        */
    }
    
}
