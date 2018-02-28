#!/bin/bash

[[ -z "`docker service ls -qf name=makerkeeper`" ]] || docker service rm makerkeeper

provider="parity"
image="`whoami`/makerkeeper:latest"

docker pull $image

docker service create \
    --name "makerkeeper" \
    --mode "global" \
    --restart-condition "none" \
    --mount "type=volume,source=ethprovider_ipc,destination=/tmp/ipc" \
    --env "ETH_ADDRESS=$ETH_ADDRESS" \
    --env "ETH_PROVIDER=/tmp/ipc/$provider.ipc" \
    --secret "$ETH_ADDRESS" \
    --detach \
    $image

docker service logs -f makerkeeper
