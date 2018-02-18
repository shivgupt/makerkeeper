#!/bin/bash

[[ -z "`docker service ls -qf name=makerkeeper`" ]] || docker service rm makerkeeper

image="`whoami`/makerkeeper:latest"

docker pull $image

docker service create \
    --name "makerkeeper" \
    --mode "global" \
    --mount "type=volume,source=ethprovider_ipc,destination=/tmp/ipc" \
    --detach \
    $image

docker service logs -f makerkeeper
