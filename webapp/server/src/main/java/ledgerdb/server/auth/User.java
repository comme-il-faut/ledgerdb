package ledgerdb.server.auth;

import java.security.Principal;

public class User implements Principal {

    private final int id;
    private final String name;
    
    public User(int id, String name) {
        this.id = id;
        this.name = name;
    }
    
    public int getId() {
        return id;
    }
    
    @Override
    public String getName() {
        return name;
    }

}
