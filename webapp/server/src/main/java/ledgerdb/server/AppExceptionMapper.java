package ledgerdb.server;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

@Provider
public class AppExceptionMapper implements ExceptionMapper<Exception> {

    @Override
    public Response toResponse(Exception e) {
        String message;
        if (e instanceof AppException)
            message = e.getMessage();
        else
            message = e.toString();
        
        return Response.serverError()
                .entity(message)
                .type(MediaType.TEXT_PLAIN)
                .build();
    }

}
