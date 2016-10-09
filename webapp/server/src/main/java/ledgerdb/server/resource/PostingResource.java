package ledgerdb.server.resource;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.Date;
import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ledgerdb.server.config.DbConfig;

@Path("/posting")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
public class PostingResource {
    
    private static final Logger LOG = LoggerFactory.getLogger(PostingResource.class);

    private final DbConfig dbConfig;
    
    @Inject
    public PostingResource(DbConfig dbConfig) {
        this.dbConfig = dbConfig;
    }
    
    @POST
    public Posting post(@NotNull @Valid Posting posting) {
        LOG.info("posting = {}", posting.toString());
        return posting;
    }
    
    public static class Posting {
        
        @JsonFormat(shape=JsonFormat.Shape.STRING, pattern="yyyy-MM-dd")
        public final Date date;
        
        public final int cr;
        
        public final int dr;
        
        @DecimalMin(value = "0.0", inclusive = false)
        public final BigDecimal amount;
        
        @NotNull
        public final String description;
        
        @JsonCreator
        public Posting(
                @JsonProperty("date") Date date,
                @JsonProperty("cr") int cr,
                @JsonProperty("dr") int dr,
                @JsonProperty("amount") BigDecimal amount,
                @JsonProperty("description") String description) {
            this.date = date;
            this.cr = cr;
            this.dr = dr;
            this.amount = amount;
            this.description = description;
        }
    }

}
