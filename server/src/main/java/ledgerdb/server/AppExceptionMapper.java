package ledgerdb.server;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Provider
public class AppExceptionMapper implements ExceptionMapper<Exception> {
    
    private static final Logger logger = LoggerFactory.getLogger(AppExceptionMapper.class);
    
    @Override
    public Response toResponse(Exception e) {
        //LOG.warn("Exception occurred: " + e.toString(), e);
        
        String message;
        if (e instanceof AppException) {
            message = e.getMessage();
        } else {
            message = e.toString();
            logger.warn("Exception occurred: " + e.toString(), e);
        }
        
        return Response.serverError()
                .entity(message)
                .type(MediaType.TEXT_PLAIN)
                .build();
    }

}
