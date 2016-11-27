package ledgerdb.server.auth;

import io.dropwizard.auth.AuthenticationException;
import io.dropwizard.auth.Authenticator;
import io.dropwizard.auth.basic.BasicCredentials;
import java.util.Optional;
import ledgerdb.server.db.SysUser;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.criterion.Restrictions;
import org.mindrot.jbcrypt.BCrypt;

public class AppAuthenticator implements Authenticator<BasicCredentials, User> {

    private final SessionFactory sf;
    
    public AppAuthenticator(SessionFactory sf) {
        this.sf = sf;
    }

    @Override
    public Optional<User> authenticate(BasicCredentials c) throws AuthenticationException {
        SysUser u;
        try (Session s = sf.openSession()) {
            Transaction tx = s.beginTransaction();
            u = (SysUser)s.createCriteria(SysUser.class)
                    .add(Restrictions.eq("name", c.getUsername()))
                    .uniqueResult();
            tx.commit();
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
    
    //public void update(String username, String password) {
        /*
        final String sql = "update sys_user set pw = ? where user_name = ?";
        try (Connection con = dbConfig.getConnection();
                PreparedStatement st = con.prepareStatement(sql)) {
            String pw = BCrypt.hashpw(password, BCrypt.gensalt());
            st.setString(1, pw);
            st.setString(2, username);
            st.executeUpdate();
        }
        */
    //}
}
