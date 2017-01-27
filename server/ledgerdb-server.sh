#!/usr/bin/bash -ex

jarfile=target/ledgerdb-server-1.0-SNAPSHOT.jar

if find target/classes/ -type f -name '*.class' -newer $jarfile | grep -q .
then
    mvn package
fi

java -jar $jarfile server config.yml
