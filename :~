#!/bin/bash

provider="parity"
image="`whoami`/makerkeeper_bot:latest"

[[ -z "`docker service ls -qf name=makerkeeper_bot`" ]] || docker service rm makerkeeper_bot

if [[ -z "$ETH_ADDRESS" ]] 
then
    echo "Please set ETH_ADDRESS"
    exit
fi

if [[ -z "`docker secret ls -qf name=makerkeeper_postgres`" ]]
then
    head -c30 /dev/urandom | base64 | tr -d '\n\r' | docker secret create makerkeeper_postgres -
    echo "Postgres secret initialized"
fi 

docker pull $image

mkdir -p /tmp/makerkeeper

cat -> /tmp/makerkeeper/docker-compose.yml <<EOF
version: '3.4'

secrets:
    makerkeeper_postgres:
        external: true
    $ETH_ADDRESS:
        external: true

volumes:
    postgres:
    ethprovider_ipc:
        external: true

networks:
    back:

services:
    bot:
        image: $image
        deploy:
            mode: global
            restart_policy:
                condition: none
        depends_on:
            - db
        secrets: 
            - makerkeeper_postgres
            - $ETH_ADDRESS
        environment:
            - ETH_ADDRESS=$ETH_ADDRESS
            - ETH_PROVIDER=/tmp/ipc/$provider.ipc
            - PGHOST=db
            - PGPORT=5432
            - PGUSER=mk
            - PGDATABASE=mk
            - PGPASSFILE=/run/secrets/makerkeeper_postgres
        volumes:
            - ethprovider_ipc:/tmp/ipc
        networks:
            - back

    db:
        image: postgres:10
        deploy:
            mode: global
        secrets:
            - makerkeeper_postgres
        environment:
            - POSTGRES_USER=mk
            - POSTGRES_DB=mk
            - POSTGRES_PASSWORD_FILE=/run/secrests/makerkeeper_postgres
        volumes:
            - postgres:/var/lib/postgresql/data
        networks:
            - back
EOF

docker stack deploy -c /tmp/makerkeeper/docker-compose.yml makerkeeper
rm /tmp/makerkeeper/docker-compose.yml

docker service logs -f makerkeeper_bot
