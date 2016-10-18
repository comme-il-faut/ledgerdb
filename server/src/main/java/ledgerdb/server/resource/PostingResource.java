package ledgerdb.server.resource;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.dropwizard.auth.Auth;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Date;
import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import ledgerdb.server.AppException;
import ledgerdb.server.JsonUtils;
import ledgerdb.server.auth.User;

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
    
    @GET
    @Path("/")
    public String get() throws SQLException, JsonProcessingException {
        try (Connection con = dbConfig.getConnection();
                Statement st = con.createStatement()) {
            ResultSet rs = st.executeQuery(
                    "select \n"
                    + "  s.*, \n"
                    + "  a.name as account_name \n"
                    + "from ( \n"
                    + "  select * \n"
                    + "  from posting_header \n"
                    + "  natural join posting_detail \n"
                    + ") s \n"
                    + "join account a \n"
                    + "  on a.account_id = s.account_id \n"
                    + "order by \n"
                    + "  posting_header_id desc, \n"
                    + "  posting_detail_id \n"
            );
            return JsonUtils.format(rs);
        }
    }
    
    @POST
    @Path("/")
    public Posting post(
            @Auth User user,
            @NotNull @Valid Posting posting) throws SQLException {
        LOG.info("posting = {}", posting.toString());
        
        try (Connection con = dbConfig.getConnection()) {
            
            //TODO check cr/dr accounts exist
            
            con.setAutoCommit(false);
            try (PreparedStatement st1 = con.prepareStatement(
                        "insert into posting_header " +       
                        "(posting_date, accountable_user_id, description)" +
                        "values (?, ?, ?)",
                        Statement.RETURN_GENERATED_KEYS);
                PreparedStatement st2 = con.prepareStatement(
                        "insert into posting_detail " +       
                        "(posting_header_id, account_id, amount)" +
                        "values (?, ?, ?)",
                        Statement.RETURN_GENERATED_KEYS)
            ) {
                st1.setDate(1, new java.sql.Date(posting.date.getTime()));
                st1.setInt(2, user.getId());
                st1.setString(3, posting.description);
                st1.executeUpdate();
                
                ResultSet rs = st1.getGeneratedKeys();
                if (!rs.next())
                    throw new AppException("Failed to generatate posting_header_pk");
                
                int id = rs.getInt(1);
                
                st2.setInt(1, id);
                st2.setInt(2, posting.cr);
                st2.setBigDecimal(3, posting.amount.negate());
                st2.executeUpdate();
                
                st2.setInt(1, id);
                st2.setInt(2, posting.dr);
                st2.setBigDecimal(3, posting.amount);
                st2.executeUpdate();
                
                con.commit();
            } catch (Exception e) {
                con.rollback();
                throw e;
            } finally {
                con.setAutoCommit(true);
            }
            
        }
        return posting;
    }
    
    public static class Posting {
        
        @NotNull
        @JsonFormat(shape=JsonFormat.Shape.STRING, pattern="yyyy-MM-dd")
        public final Date date;
        
        public final int cr;
        
        public final int dr;
        
        @NotNull
        @DecimalMin(value = "0.0", inclusive = false)
        public final BigDecimal amount;
        
        @NotNull
        @Pattern(regexp = "^\\p{Print}{0,64}$")
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
