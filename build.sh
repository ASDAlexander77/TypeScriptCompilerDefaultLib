#!/bin/bash
if [ "$1" == "debug" ] ; then	
    ./scripts/build.sh debug gcc pic
else    
    ./scripts/build.sh release gcc pic
fi
