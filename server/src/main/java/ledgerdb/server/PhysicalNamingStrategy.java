package ledgerdb.server;

import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;

public class PhysicalNamingStrategy extends PhysicalNamingStrategyStandardImpl {

    @Override
    public Identifier toPhysicalTableName(Identifier name, JdbcEnvironment context) {
        return toPhysicalName(name);
    }
    
    @Override
    public Identifier toPhysicalColumnName(Identifier name, JdbcEnvironment context) {
        return toPhysicalName(name);
    }
    
    private Identifier toPhysicalName(Identifier name) {
        String text = name.getText();
        if (text.matches(".*[A-Z][a-z].*")) {
            text = text.replaceAll("(?<=.)(?=[A-Z])", "_").toLowerCase();
            name = new Identifier(text, name.isQuoted());
        }
        return name;
    }
}
