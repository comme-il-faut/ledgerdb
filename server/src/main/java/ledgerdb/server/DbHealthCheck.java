package ledgerdb.server;

import com.codahale.metrics.health.HealthCheck;

public class DbHealthCheck extends HealthCheck {

    @Override
    protected Result check() throws Exception {
        //TODO
        return Result.healthy();
    }

}
