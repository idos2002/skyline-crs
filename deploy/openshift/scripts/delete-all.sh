#!/usr/bin/env bash

SCRIPT_DIR=$(dirname $(realpath $0))
cd $SCRIPT_DIR/..

oc delete -f apps
oc delete -f volumes
oc delete -f config
