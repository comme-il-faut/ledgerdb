package ledgerdb.server.resource;

import io.dropwizard.auth.Auth;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import ledgerdb.server.auth.User;
import ledgerdb.server.db.Statement;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path("/statement")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
public class StatementResource {

    private static final Logger logger = LoggerFactory.getLogger(PostingResource.class);
    
    private final SessionFactory sf;
    
    @Inject
    public StatementResource(SessionFactory sf) {
        this.sf = sf;
    }
        
    @POST
    @Produces(MediaType.TEXT_PLAIN)
    public String post(
            @Auth User user,
            @NotNull @Valid Statement statement) {
        
        try (Session s = sf.openSession()) {
            Transaction tx = s.beginTransaction();
            
            int count = ((Number)s.createQuery("select count(s) from Statement s"
                    + " where date = :date"
                    + " and accountId = :accountId"
                    + " and amount = :amount"
                    + " and description = :description"
                    + " and source = :source")
                    .setParameter("date", statement.getDate())
                    .setParameter("accountId", statement.getAccountId())
                    .setParameter("amount", statement.getAmount())
                    .setParameter("description", statement.getDescription())
                    .setParameter("source", statement.getSource())
                    .uniqueResult()).intValue();
            if (count >= statement.getSequence())
                return "0";
            
            s.persist(statement);
            tx.commit();
        }
        return String.valueOf(statement.getId());
    }
}
