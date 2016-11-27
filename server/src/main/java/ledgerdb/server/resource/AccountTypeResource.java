package ledgerdb.server.resource;

import ledgerdb.server.JsonUtils;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.hibernate.Session;
import org.hibernate.SessionFactory;

@Path(value = "/account_type")
@Produces(MediaType.APPLICATION_JSON)
public class AccountTypeResource {

    private final SessionFactory sf;
    
    @Inject
    public AccountTypeResource(SessionFactory sf) {
        this.sf = sf;
    }
    
    @GET
    public String getAccountTypes() throws SQLException {
        try (Session s = sf.openSession()) {
            return s.doReturningWork(con -> {
                try (Statement st = con.createStatement()) {
                    ResultSet rs = st.executeQuery(
                        "select * from account_type order by mask"
                    );
                    return JsonUtils.format(rs);
                }
            });
        }
    }
    
}
