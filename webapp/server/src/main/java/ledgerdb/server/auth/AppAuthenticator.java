package ledgerdb.server.auth;

import io.dropwizard.auth.AuthenticationException;
import io.dropwizard.auth.Authenticator;
import io.dropwizard.auth.basic.BasicCredentials;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;
import ledgerdb.server.config.DbConfig;
import org.mindrot.jbcrypt.BCrypt;

public class AppAuthenticator implements Authenticator<BasicCredentials, User> {

    private final DbConfig dbConfig;

    public AppAuthenticator(DbConfig dbConfig) {
        this.dbConfig = dbConfig;
    }

    @Override
    public Optional<User> authenticate(BasicCredentials c) throws AuthenticationException {
        final String sql = "select pw from sys_user where user_name = ?";
        try (Connection con = dbConfig.getConnection();
                PreparedStatement st = con.prepareStatement(sql)) {
            st.setString(1, c.getUsername());
            ResultSet rs = st.executeQuery();
            boolean ok = false;
            if (rs.next()) {
                String pw = rs.getString(1);
                if (pw == null && (c.getPassword() == null || c.getPassword().isEmpty()))
                    ok = true;
                if (pw != null && c.getPassword() != null)
                    ok = BCrypt.checkpw(c.getPassword(), pw);
            }
            return ok
                    ? Optional.of(new User(c.getUsername()))
                    : Optional.empty();
        } catch (SQLException e) {
            throw new AuthenticationException(e);
        }
    }

    public void update(String username, String password) throws SQLException {
        final String sql = "update sys_user set pw = ? where user_name = ?";
        try (Connection con = dbConfig.getConnection();
                PreparedStatement st = con.prepareStatement(sql)) {
            String pw = BCrypt.hashpw(password, BCrypt.gensalt());
            st.setString(1, pw);
            st.setString(2, username);
            st.executeUpdate();
        }
    }
}
