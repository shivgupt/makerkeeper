#!/bin/bash

provider="geth"
image="`whoami`/makerkeeper_console:latest"

[[ -z "`docker service ls -qf name=makerkeeper_console`" ]] || docker service rm makerkeeper_console

if [[ -z "$ETH_ADDRESS" ]] 
then
    echo "Please set ETH_ADDRESS"
    exit
fi

docker pull $image

docker service create \
    --name "makerkeeper_console" \
    --mode "global" \
    --restart-condition "none" \
    --secret "makerkeeper_postgres" \
    --secret "$ETH_ADDRESS" \
    --env "ETH_ADDRESS=$ETH_ADDRESS" \
    --env "ETH_PROVIDER=/tmp/ipc/$provider.ipc" \
    --env "PGHOST=db" \
    --env "PGPORT=5432" \
    --env "PGUSER=mk" \
    --env "PGDATABASE=mk" \
    --env "PGPASSFILE=/run/secrets/makerkeeper_postgres" \
    --mount "type=volume,source=ethprovider_ipc,destination=/tmp/ipc" \
    --network "makerkeeper_back" \
    --detach \
    $image

containerid=`docker service ps -q makerkeeper_console | head -n1`

container=`docker inspect --format '{{.NodeID}}{{.Status.ContainerStatus.ContainerID}}' $containerid | head -c25`
containerid=`echo $containerid | head -c25`
echo docker exec -it makerkeeper_console.$container.$containerid node -i -r /root/ck.js

docker exec -it makerkeeper_console.$container.$containerid node -i -r /root/console.js
