package ledgerdb.server;

import com.google.common.reflect.ClassPath;
import com.google.inject.Guice;
import com.google.inject.Injector;
import ledgerdb.server.config.AppConfig;
import ledgerdb.server.auth.AppAuthenticator;
import ledgerdb.server.auth.AppAuthorizer;
import ledgerdb.server.auth.User;
import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.auth.AuthDynamicFeature;
import io.dropwizard.auth.AuthValueFactoryProvider;
import io.dropwizard.auth.basic.BasicCredentialAuthFilter;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import java.io.IOException;
import org.glassfish.jersey.server.filter.RolesAllowedDynamicFeature;

public class App extends Application<AppConfig> {

    public static void main(final String[] args) throws Exception {
        new App().run(args);
    }

    @Override
    public String getName() {
        return "LedgerDB Server";
    }

    @Override
    public void initialize(final Bootstrap<AppConfig> bootstrap) {
        bootstrap.addBundle(new AssetsBundle("/assets/", "/", "index.html", "assets"));
    }

    @Override
    public void run(AppConfig config, Environment env) throws IOException {
        env.healthChecks().register("db", new DbHealthCheck());

        env.jersey().register(new AuthDynamicFeature(new BasicCredentialAuthFilter.Builder<User>()
                .setAuthenticator(new AppAuthenticator(config.getDbConfig()))
                .setAuthorizer(new AppAuthorizer())
                .setRealm(config.getAuth().getRealm())
                .buildAuthFilter()));
        env.jersey().register(new AuthValueFactoryProvider.Binder<>(User.class));
        env.jersey().register(RolesAllowedDynamicFeature.class);

        Injector injector = Guice.createInjector(new AppModule(config));
        ClassPath cp = ClassPath.from(ClassLoader.getSystemClassLoader());
        String packageName = getClass().getPackage().getName() + ".resource";
        for (ClassPath.ClassInfo ci : cp.getTopLevelClassesRecursive(packageName)) {
            Object resource = injector.getInstance(ci.load());
            env.jersey().register(resource);
        }
    }

}
