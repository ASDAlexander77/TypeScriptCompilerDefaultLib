#!/bin/bash
if [ "$1" == "debug" ] ; then
    ./scripts/build.sh debug gcc pic
elif [ "$1" == "release" ] ; then
    ./scripts/build.sh release gcc pic
else
    ./scripts/build.sh release gcc pic || exit $?
    ./scripts/build.sh debug gcc pic || exit $?
fi
