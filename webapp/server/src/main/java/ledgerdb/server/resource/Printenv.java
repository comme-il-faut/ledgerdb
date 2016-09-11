package ledgerdb.server.resource;

import java.util.stream.Collectors;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path(value = "/printenv")
@Produces(MediaType.TEXT_PLAIN)
public class Printenv {
    
    @GET
    public String get() {
        return System.getenv().keySet().stream()
                .sorted()
                .map((key) -> key + "=" + System.getenv(key))
                .collect(Collectors.joining("\n"));
        /*
        StringBuilder sb = new StringBuilder();
        Map<String, String> env = System.getenv();
        ArrayList<String> keys = new ArrayList<>(env.keySet());
        Collections.sort(keys);
        for (String key : keys) {
            sb.append(key);
            sb.append("=");
            sb.append(env.get(key));
            sb.append("\n");
        }
        return sb.toString();
        */
    }
}
