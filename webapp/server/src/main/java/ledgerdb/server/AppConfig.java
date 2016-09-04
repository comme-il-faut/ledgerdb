package ledgerdb.server;

import io.dropwizard.Configuration;
import com.fasterxml.jackson.annotation.JsonProperty;
import javax.validation.Valid;
import org.hibernate.validator.constraints.*;
import javax.validation.constraints.*;

public class AppConfig extends Configuration {
    
    @Valid
    @NotNull
    private DbConfig database = new DbConfig();
    
    @JsonProperty("database")
    public DbConfig getDbConnection() {
        return database;
    }
    
    @JsonProperty("database")
    public void setDbConnection(DbConfig database) {
        this.database = database;
    }
}
