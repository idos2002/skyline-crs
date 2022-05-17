#!/usr/bin/env bash

oc apply -f config
oc apply -f volumes
oc apply -f apps
