#!/bin/bash
if [ "$1" == "debug" ] ; then
    ./scripts/build2.sh debug gcc pic
elif [ "$1" == "release" ] ; then
    ./scripts/build2.sh release gcc pic
else
    ./scripts/build2.sh release gcc pic || exit $?
    ./scripts/build2.sh debug gcc pic || exit $?
fi
