#!/bin/bash
if [ "$1" == "debug" ] ; then	
    ./scripts/build.sh debug clang
else    
    ./scripts/build.sh release clang
fi
