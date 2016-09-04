# LedgerDB Server

How to start the LedgerDB Server application
---

1. Run `mvn clean package` to build your application
1. Start application with `java -jar target/ledgerdb-server-1.0-SNAPSHOT.jar server config.yml`
1. To check that your application is running enter url `http://localhost:8080`

Health Check
---

To see your applications health enter url `http://localhost:8081/healthcheck`
