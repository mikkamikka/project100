#!/bin/sh

cd `dirname $0`
http-server -a 127.0.0.1 -p 8080 --cors
