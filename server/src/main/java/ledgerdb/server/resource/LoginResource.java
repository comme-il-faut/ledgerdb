package ledgerdb.server.resource;

import io.dropwizard.auth.Auth;
import java.io.InputStream;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import ledgerdb.server.auth.User;

@Path(value = "/login")
@Produces(MediaType.TEXT_HTML)
public class LoginResource {

    @GET
    public InputStream login(@Auth User user) {
        return getClass().getResourceAsStream("/assets/login.html");
    }
    
}
