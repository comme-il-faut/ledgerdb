package ledgerdb.server.auth;

import io.dropwizard.auth.AuthenticationException;
import io.dropwizard.auth.Authenticator;
import io.dropwizard.auth.basic.BasicCredentials;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import ledgerdb.server.db.SysUser;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.criterion.Restrictions;
import org.mindrot.jbcrypt.BCrypt;

public class AppAuthenticator implements Authenticator<BasicCredentials, User> {

    private final SessionFactory sf;
    
    private final Map<String, SysUser> cache = new ConcurrentHashMap<>();
    
    public AppAuthenticator(SessionFactory sf) {
        this.sf = sf;
    }

    @Override
    public Optional<User> authenticate(BasicCredentials c) throws AuthenticationException {
        SysUser u = cache.get(c.getUsername());
        if (u == null) {
            try (Session s = sf.openSession()) {
                Transaction tx = s.beginTransaction();
                u = (SysUser)s.createCriteria(SysUser.class)
                        .add(Restrictions.eq("name", c.getUsername()))
                        .uniqueResult();
                tx.commit();
            }
            if (u != null) cache.put(c.getUsername(), u);
        }
        if (u == null) return Optional.empty();
        
        boolean ok = false;
        if (u.getPw() == null && (c.getPassword() == null || c.getPassword().isEmpty()))
            ok = true;
        if (u.getPw() != null && c.getPassword() != null)
            ok = BCrypt.checkpw(c.getPassword(), u.getPw());
        
        return ok
                ? Optional.of(new User(u.getId(), u.getName()))
                : Optional.empty();
    }

    public String hashpw(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }
    
    public void clearCache(String username) {
        cache.remove(username);
    }
}