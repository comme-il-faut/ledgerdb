package ledgerdb.server.config;

import io.dropwizard.Configuration;
import com.fasterxml.jackson.annotation.JsonProperty;
import javax.validation.Valid;
import javax.validation.constraints.*;

public class AppConfig extends Configuration {
    
    @NotNull
    @Valid
    private AuthConfig auth = new AuthConfig();

    @NotNull
    @Valid
    private DbConfig database = new DbConfig();

    @JsonProperty("auth")
    public AuthConfig getAuth() {
        return auth;
    }

    @JsonProperty("auth")
    public void setAuth(AuthConfig auth) {
        this.auth = auth;
    }
    
    @JsonProperty("database")
    public DbConfig getDbConfig() {
        return database;
    }
    
    @JsonProperty("database")
    public void setDbConfig(DbConfig database) {
        this.database = database;
    }
    
}
