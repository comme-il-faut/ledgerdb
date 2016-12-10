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
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import ledgerdb.server.ResponseFormatter;
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
    }
    
}
