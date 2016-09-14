package ledgerdb.server.auth;

import io.dropwizard.auth.Authorizer;

public class AppAuthorizer implements Authorizer<User> {

    @Override
    public boolean authorize(User p, String role) {
        return false;
    }

}
