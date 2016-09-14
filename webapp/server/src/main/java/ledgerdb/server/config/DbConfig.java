package ledgerdb.server.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.sql.Connection;
import java.sql.SQLException;
import org.apache.commons.dbcp2.BasicDataSource;

public class DbConfig {

    private final BasicDataSource bds = new BasicDataSource();
    
    @JsonProperty
    public void setDriver(String driver) {
        bds.setDriverClassName(driver);
    }

    @JsonProperty
    public void setUrl(String url) {
        bds.setUrl(url);
    }

    @JsonProperty
    public void setUsername(String username) {
        bds.setUsername(username);
    }

    @JsonProperty
    public void setPassword(String password) {
        bds.setPassword(password);
    }
    
    public Connection getConnection() throws SQLException {
        return bds.getConnection();
    }

}
