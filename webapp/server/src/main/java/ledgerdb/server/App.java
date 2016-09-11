package ledgerdb.server;

import ledgerdb.server.resource.AccountTypeResource;
import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import ledgerdb.server.resource.AccountResource;
import ledgerdb.server.resource.Printenv;

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
    public void run(AppConfig config, Environment env) {
        env.jersey().register(new AccountTypeResource(config.getDbConnection()));
        env.jersey().register(new AccountResource(config.getDbConnection()));
        env.jersey().register(new Printenv());
    }

}
