package ledgerdb.server;

import com.google.common.reflect.ClassPath;
import com.google.inject.AbstractModule;
import com.google.inject.Guice;
import com.google.inject.Injector;
import java.io.IOException;
import java.util.stream.Stream;
import ledgerdb.server.config.AppConfig;
import ledgerdb.server.config.DbConfig;

public class Resources {

    static Stream<Object> createResources(AppConfig config) throws IOException {
        Injector injector = Guice.createInjector(new AbstractModule() {
            @Override
            protected void configure() {
                bind(AppConfig.class).toInstance(config);
                bind(DbConfig.class).toInstance(config.getDbConfig());
            }
        });
        ClassPath cp = ClassPath.from(ClassLoader.getSystemClassLoader());
        String packageName = Resources.class.getPackage().getName() + ".resource";
        return cp.getTopLevelClassesRecursive(packageName).stream().map(ci ->
                injector.getInstance(ci.load()));
    }

}
