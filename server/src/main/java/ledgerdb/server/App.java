package ledgerdb.server;

import ledgerdb.server.auth.User;
import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.auth.AuthDynamicFeature;
import io.dropwizard.auth.AuthValueFactoryProvider;
import io.dropwizard.auth.basic.BasicCredentialAuthFilter;
import io.dropwizard.db.DataSourceFactory;
import io.dropwizard.hibernate.HibernateBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import org.glassfish.jersey.server.ServerProperties;
import org.glassfish.jersey.server.filter.RolesAllowedDynamicFeature;
import org.hibernate.cfg.AvailableSettings;

public class App extends Application<AppConfig> {

    public static void main(final String[] args) throws Exception {
        new App().run(args);
    }
    
    private final HibernateBundle<AppConfig> hibernateBundle;
    
    private App() throws IOException {
        List<Class<?>> entities
                = ObjectFactory.getClasses("db").collect(Collectors.toList());
        hibernateBundle = new HibernateBundle<AppConfig>(
                entities.get(0),
                entities.stream().skip(1).toArray(size -> new Class<?>[size])
        ) {
            @Override
            public DataSourceFactory getDataSourceFactory(AppConfig configuration) {
                return configuration.getDataSourceFactory();
            }
            
            @Override
            protected void configure(org.hibernate.cfg.Configuration configuration) {
                configuration.setPhysicalNamingStrategy(NameMapper.createPhysicalNamingStrategy());
                configuration.setProperty(AvailableSettings.USE_SQL_COMMENTS, "true");
                configuration.setProperty(AvailableSettings.FORMAT_SQL, "true");
            }
        };
    }

    @Override
    public String getName() {
        return "LedgerDB-Server";
    }

    @Override
    public void initialize(final Bootstrap<AppConfig> bootstrap) {
        bootstrap.addBundle(new AssetsBundle("/assets/", "/", "index.html", "assets"));
        bootstrap.addBundle(hibernateBundle);
    }

    @Override
    public void run(AppConfig config, Environment env) throws IOException {
        ObjectFactory of = new ObjectFactory(config, hibernateBundle.getSessionFactory());

        env.jersey().register(new AuthDynamicFeature(new BasicCredentialAuthFilter.Builder<User>()
                .setAuthenticator(of.getAppAuthenticator())
                .setAuthorizer(of.getAppAuthorizer())
                .setRealm(config.getAuth().getRealm())
                .buildAuthFilter()));
        env.jersey().register(new AuthValueFactoryProvider.Binder<>(User.class));
        env.jersey().register(RolesAllowedDynamicFeature.class);
        
        env.jersey().register(AppExceptionMapper.class);
        env.jersey().property(ServerProperties.BV_SEND_ERROR_IN_RESPONSE, true);

        of.createResources().forEach(resource ->
                env.jersey().register(resource));
    }
    

}
