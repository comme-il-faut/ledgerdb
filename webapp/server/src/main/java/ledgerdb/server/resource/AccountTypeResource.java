package ledgerdb.server.resource;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import ledgerdb.server.DbConfig;

@Path(value = "/account_type")
@Produces(MediaType.APPLICATION_JSON)
public class AccountTypeResource {

    private final DbConfig dbConfig;
    
    public AccountTypeResource(DbConfig dbConfig) {
        this.dbConfig = dbConfig;
    }
    
    @GET
    public String getAccountTypes() throws SQLException, JsonProcessingException {
        List<Map<String, Object>> rows = new ArrayList<>();
        
        try (Connection con = dbConfig.getConnection();
                Statement st = con.createStatement()) {
            ResultSet rs = st.executeQuery("select * from account_type");
            ResultSetMetaData md = rs.getMetaData();
            int columnCount = md.getColumnCount();
            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    row.put(md.getColumnName(i), rs.getObject(i));
                }
                rows.add(row);
            }
        }
        
        ObjectMapper mapper = new ObjectMapper();
        return mapper.writeValueAsString(rows);
    }
    
}
