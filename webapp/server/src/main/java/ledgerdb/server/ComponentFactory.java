package ledgerdb.server;

import com.google.common.reflect.ClassPath;
import com.google.inject.AbstractModule;
import com.google.inject.Guice;
import com.google.inject.Injector;
import java.io.IOException;
import java.util.stream.Stream;
import ledgerdb.server.auth.AppAuthenticator;
import ledgerdb.server.auth.AppAuthorizer;
import ledgerdb.server.config.AppConfig;
import ledgerdb.server.config.DbConfig;

public class ComponentFactory extends AbstractModule {

    private final AppConfig config;
    
    private final AppAuthenticator authenticator;
    private final AppAuthorizer authorizer;

    public ComponentFactory(AppConfig config) {
        this.config = config;
        this.authenticator = new AppAuthenticator(config.getDbConfig());
        this.authorizer = new AppAuthorizer();
    }
    
    public AppAuthenticator getAppAuthenticator() {
        return authenticator;
    }
    public AppAuthorizer getAppAuthorizer() {
        return authorizer;
    }
    
    @Override
    protected void configure() {
        bind(AppConfig.class).toInstance(config);
        bind(DbConfig.class).toInstance(config.getDbConfig());
        
        bind(AppAuthenticator.class).toInstance(authenticator);
        bind(AppAuthorizer.class).toInstance(authorizer);
    }
    
    public Stream<Object> createResources() throws IOException {
        Injector injector = Guice.createInjector(this);
        ClassPath cp = ClassPath.from(ClassLoader.getSystemClassLoader());
        String packageName = getClass().getPackage().getName() + ".resource";
        return cp.getTopLevelClassesRecursive(packageName).stream().map(ci ->
                injector.getInstance(ci.load()));
    }

}
