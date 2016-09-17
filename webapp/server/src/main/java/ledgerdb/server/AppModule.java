package ledgerdb.server;

import com.google.inject.AbstractModule;
import ledgerdb.server.config.AppConfig;
import ledgerdb.server.config.DbConfig;

public class AppModule extends AbstractModule {

    private AppConfig config;
    
    public AppModule(AppConfig config) {
        this.config = config;
    }
    
    @Override
    protected void configure() {
        bind(AppConfig.class).toInstance(config);
        bind(DbConfig.class).toInstance(config.getDbConfig());
    }

}
