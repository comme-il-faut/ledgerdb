package ledgerdb.server;

import com.google.common.reflect.ClassPath;
import com.google.inject.AbstractModule;
import com.google.inject.Guice;
import com.google.inject.Injector;
import java.io.IOException;
import java.util.stream.Stream;
import ledgerdb.server.auth.AppAuthenticator;
import ledgerdb.server.auth.AppAuthorizer;
import org.hibernate.SessionFactory;

public class ObjectFactory extends AbstractModule {

    private final AppConfig config;
    private final SessionFactory sf;

    private final AppAuthenticator authenticator;
    private final AppAuthorizer authorizer;

    public ObjectFactory(AppConfig config, SessionFactory sf) {
        this.config = config;
        this.sf = sf;
        
        this.authenticator = new AppAuthenticator(sf);
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
        
        bind(SessionFactory.class).toInstance(sf);
        
        bind(AppAuthenticator.class).toInstance(authenticator);
        bind(AppAuthorizer.class).toInstance(authorizer);
    }
    
    public Stream<Object> createResources() throws IOException {
        Injector injector = Guice.createInjector(this);
        return getClasses("resource")
                .map(c -> injector.getInstance(c));
    }

    public static Stream<Class<?>> getClasses(String subpackage) throws IOException {
        ClassPath cp = ClassPath.from(ClassLoader.getSystemClassLoader());
        String packageName = ObjectFactory.class.getPackage().getName() + "." + subpackage;
        return cp.getTopLevelClassesRecursive(packageName)
                .stream()
                .map(ci -> ci.load());
    }
}
