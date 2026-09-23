// Catching an error the default library throws: String.repeat throws a RangeError for a
// negative count, and the RangeError class is thrown by the library, not by this program.
// On Linux an untyped catch only recognised classes its own module throws, so it bound the
// error as a plain object and `<RangeError>e` threw "Can't cast from any type" - see
// TypeScriptCompiler #351, where a class's type_info started carrying its own box thunk.

function typedCatch() {
    let caught = false;
    try {
        "ab".repeat(-1);
    } catch (e: RangeError) {
        caught = true;
    }

    return caught;
}

function untypedCatchCast() {
    let isError = false;
    try {
        "ab".repeat(-1);
    } catch (e) {
        // the cast itself used to throw
        const rangeError = <RangeError>e;
        isError = rangeError instanceof Error;
    }

    return isError;
}

function untypedCatchInstanceof() {
    let isRangeError = false;
    try {
        "ab".repeat(-1);
    } catch (e: any) {
        isRangeError = e instanceof RangeError;
    }

    return isRangeError;
}

function main() {
    assert(typedCatch(), "catch (e: RangeError)");
    assert(untypedCatchCast(), "<RangeError>e in an untyped catch");
    assert(untypedCatchInstanceof(), "instanceof RangeError in an any catch");

    console.log("ALL DONE");
}
