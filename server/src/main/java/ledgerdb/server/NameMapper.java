package ledgerdb.server;

import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.boot.model.naming.PhysicalNamingStrategy;
import org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;

public class NameMapper {
    
    public static PhysicalNamingStrategy createPhysicalNamingStrategy() {
        return new PhysicalNamingStrategyImpl();
    }
    
    public static String toPhysicalName(String s) {
        if (s.matches(".*[A-Z][a-z].*")) {
            s = s.replaceAll("(?<=.)(?=[A-Z])", "_").toLowerCase();
        }
        return s;
    }
    
    public static String toLogicalName(String s) {
        StringBuilder sb = new StringBuilder(s.length());
        boolean flag = false;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '_') {
                flag = true;
                continue;
            }
            if (flag) c = Character.toUpperCase(c);
            flag = false;
            sb.append(c);
        }
        return sb.toString();
    }

    private static class PhysicalNamingStrategyImpl extends PhysicalNamingStrategyStandardImpl {

        @Override
        public Identifier toPhysicalTableName(Identifier name, JdbcEnvironment context) {
            return toPhysicalName(name);
        }

        @Override
        public Identifier toPhysicalColumnName(Identifier name, JdbcEnvironment context) {
            return toPhysicalName(name);
        }

        private Identifier toPhysicalName(Identifier name) {
            String text1 = name.getText();
            String text2 = NameMapper.toPhysicalName(text1);
            return text1 == text2
                    ? name
                    : new Identifier(text2, name.isQuoted());
        }
    }
}