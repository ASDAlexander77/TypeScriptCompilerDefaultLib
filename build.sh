#!/bin/bash
if [ "$1" == "debug" ] ; then	
    ./scripts/build2.sh debug gcc pic
else    
    ./scripts/build2.sh release gcc pic
fi
