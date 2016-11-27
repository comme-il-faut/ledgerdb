package ledgerdb.server;

import io.dropwizard.Configuration;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.dropwizard.db.DataSourceFactory;
import javax.validation.Valid;
import javax.validation.constraints.*;

public class AppConfig extends Configuration {
    
    @NotNull
    @Valid
    private AuthConfig auth = new AuthConfig();

    @NotNull
    @Valid
    private DataSourceFactory database = new DataSourceFactory();

    @JsonProperty("auth")
    public AuthConfig getAuth() {
        return auth;
    }
    public void setAuth(AuthConfig auth) {
        this.auth = auth;
    }
    
    @JsonProperty("database")
    public DataSourceFactory getDataSourceFactory() {
        return database;
    }
    public void setDataSourceFactory(DataSourceFactory database) {
        this.database = database;
    }
 
    public static class AuthConfig {

        @NotNull
        private String realm;

        @JsonProperty
        public void setRealm(String realm) {
            this.realm = realm;
        }

        @JsonProperty
        public String getRealm() {
            return realm;
        }

    }
}
