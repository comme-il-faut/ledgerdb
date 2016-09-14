package ledgerdb.server.resource;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;

@Path(value = "/printenv")
@Produces(MediaType.TEXT_PLAIN)
public class Printenv {
    
    @GET
    //@RolesAllowed("admin")
    //@PermitAll
    public String get(@Context HttpHeaders headers) {
        StringBuilder sb = new StringBuilder();
        
        headers.getRequestHeaders().entrySet().forEach(e -> {
                sb.append(e.getKey());
                sb.append(": ");
                sb.append(e.getValue());
                sb.append("\n");
        });
        sb.append("\n");

        System.getenv().keySet().stream()
                .sorted()
                .forEach((key) -> {
                    sb.append(key);
                    sb.append("=");
                    sb.append(System.getenv(key));
                    sb.append("\n");
                });
        return sb.toString();

        /*
        return System.getenv().keySet().stream()
                .sorted()
                .map((key) -> key + "=" + System.getenv(key))
                .collect(Collectors.joining("\n"));
        */
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
