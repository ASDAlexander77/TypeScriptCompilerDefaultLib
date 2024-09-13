#!/bin/bash
if [ "$1" == "debug" ] ; then	
    ./scripts/build.sh debug
else    
    ./scripts/build.sh release
fi
