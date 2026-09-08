#!/bin/bash
# Builds the default library for every memory model, since a program links the build that
# matches its own -mm= and there is deliberately no fallback to another model's copy.
#
#   ./build.sh                -> release and debug, all three models
#   ./build.sh release        -> release only, all three models
#   ./build.sh release rc     -> just that one
#
# See tslang/include/TypeScript/Defines.h for the resulting layout.

build_all_models() {
    for mm in gc rc none ; do
        ./scripts/build.sh "$1" gcc pic "$mm" || return $?
    done
}

if [ -n "$2" ] ; then
    ./scripts/build.sh "$1" gcc pic "$2"
elif [ "$1" == "debug" ] ; then
    build_all_models debug
elif [ "$1" == "release" ] ; then
    build_all_models release
else
    build_all_models release || exit $?
    build_all_models debug
fi
