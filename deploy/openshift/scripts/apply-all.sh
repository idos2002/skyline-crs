#!/usr/bin/env bash

SCRIPT_DIR=$(dirname $(realpath $0))
cd $SCRIPT_DIR/..

oc apply -f config
oc apply -f volumes
oc apply -f apps
