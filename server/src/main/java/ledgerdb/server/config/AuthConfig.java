package ledgerdb.server.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import javax.validation.constraints.NotNull;

public class AuthConfig {

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
