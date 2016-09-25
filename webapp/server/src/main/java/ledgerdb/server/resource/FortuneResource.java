package ledgerdb.server.resource;

import java.io.IOException;
import java.io.InputStream;
import javax.annotation.security.PermitAll;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path(value = "/fortune")
@Produces(MediaType.TEXT_PLAIN)
public class FortuneResource {

    @GET
    @PermitAll
    public InputStream fortune() throws IOException {
        Process p = Runtime.getRuntime().exec("fortune -s");
        return p.getInputStream();
    }

}
