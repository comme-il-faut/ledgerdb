package ledgerdb.server.resource;

import ledgerdb.server.ResponseFormatter;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.hibernate.Session;
import org.hibernate.SessionFactory;

@Path("/account")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
public class AccountResource {

    private final SessionFactory sf;
    
    @Inject
    public AccountResource(SessionFactory sf) {
        this.sf = sf;
    }
    
    @GET
    public String doGet() {
        try (Session s = sf.openSession()) {
            return s.doReturningWork(con -> {
                try (Statement st = con.createStatement()) {
                    ResultSet rs = st.executeQuery(
                        "select * from account order by account_id"
                    );
                    return ResponseFormatter.format(rs);
                }
            });
        }
    }
    
}
