package ledgerdb.server.resource;

import ledgerdb.server.JsonUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import ledgerdb.server.config.DbConfig;

@Path("/account")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
public class AccountResource {

    private final DbConfig dbConfig;
    
    @Inject
    public AccountResource(DbConfig dbConfig) {
        this.dbConfig = dbConfig;
    }
    
    @GET
    @Path("/")
    public String getAccounts() throws SQLException, JsonProcessingException {
        try (Connection con = dbConfig.getConnection();
                Statement st = con.createStatement()) {
            ResultSet rs = st.executeQuery("select * from account order by account_id");
            return JsonUtils.format(rs);
        }
    }
    
    @GET
    @Path("/all")
    public String getAllAccounts() throws SQLException, JsonProcessingException {
        try (Connection con = dbConfig.getConnection();
                Statement st = con.createStatement()) {
            ResultSet rs = st.executeQuery(
                    "select * from account " +
                    "natural join account_type " +
                    "order by account_id"
            );
            return JsonUtils.format(rs);
        }
    }
    
}
