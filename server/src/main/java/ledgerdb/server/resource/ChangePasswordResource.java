package ledgerdb.server.resource;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.dropwizard.auth.Auth;
import io.dropwizard.auth.AuthenticationException;
import io.dropwizard.auth.basic.BasicCredentials;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Optional;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import ledgerdb.server.AppException;
import ledgerdb.server.auth.AppAuthenticator;
import ledgerdb.server.auth.User;
import ledgerdb.server.db.SysUser;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;

@Path(value = "/chpasswd")
@Produces(MediaType.TEXT_PLAIN)
public class ChangePasswordResource {

    private final SessionFactory sf;
    private final AppAuthenticator authenticator;
    
    @Inject
    public ChangePasswordResource(SessionFactory sf, AppAuthenticator authenticator) {
        this.sf = sf;
        this.authenticator = authenticator;
    }
    
    @GET
    public String get() {
        return "ok";
    }
    
    @POST
    @Consumes(MediaType.TEXT_PLAIN)
    public void chpasswd(@Auth User user, String data)
            throws IOException, AuthenticationException, SQLException {
        
        ObjectMapper mapper = new ObjectMapper();
        JsonNode json = mapper.readTree(data);
        String oldpw = json.get("oldpw").textValue();
        String newpw = json.get("newpw").textValue();
        
        BasicCredentials bc = new BasicCredentials(user.getName(), oldpw);
        Optional<User> ou = authenticator.authenticate(bc);
        if (!ou.isPresent())
            throw new AppException("Your old password is incorrect.");
        
        String pw = authenticator.hashpw(newpw);
        
        try (Session s = sf.openSession()) {
            Transaction tx = s.beginTransaction();
            SysUser u = s.get(SysUser.class, ou.get().getId());
            u.setPw(pw);
            s.update(u);
            tx.commit();
        }
    }
}
