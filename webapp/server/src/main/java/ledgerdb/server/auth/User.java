package ledgerdb.server.auth;

import java.security.Principal;

public class User implements Principal {

    private final String name;
    
    public User(String name) {
        this.name = name;
    }
    
    @Override
    public String getName() {
        return name;
    }

}
