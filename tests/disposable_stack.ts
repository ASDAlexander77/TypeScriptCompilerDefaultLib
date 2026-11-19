// not own: use() and adopt() keep a value and give it back, which -mm=own refuses
// DisposableStack: resources disposed together, last added first, as in JavaScript
let trail = "";

class Resource {
    constructor(public name: string) {
    }

    [Symbol.dispose]() {
        trail += this.name;
    }
}

class Failing {
    constructor(public name: string) {
    }

    [Symbol.dispose]() {
        trail += this.name;
        throw new TypeError(this.name);
    }
}

function main() {
    // by `using`, at the end of the block
    {
        using stack = new DisposableStack();
        const a = stack.use(new Resource("a"));
        assert(a.name == "a", "use gives the value back");
        stack.adopt(7, (n: int) => { trail += n; });
        stack.defer(() => { trail += "c"; });
        assert(!stack.disposed, "not yet disposed");
    }

    assert(trail == "c7a", "last added first");

    // dispose() once: a second call does nothing
    trail = "";
    const stack = new DisposableStack();
    stack.use(new Resource("x"));
    stack.dispose();
    stack.dispose();
    assert(trail == "x" && stack.disposed, "disposed once");

    let refused = false;
    try {
        stack.defer(() => { });
    } catch (e) {
        refused = e instanceof ReferenceError;
    }

    assert(refused, "a disposed stack takes nothing more");

    // move() hands the resources on
    trail = "";
    const first = new DisposableStack();
    first.use(new Resource("m"));
    const second = first.move();
    assert(first.disposed && !second.disposed, "move leaves the first disposed");
    first.dispose();
    assert(trail == "", "the first has nothing left");
    second.dispose();
    assert(trail == "m", "the second disposes them");

    // a failure does not stop the rest; one failure is thrown as it is
    trail = "";
    const one = new DisposableStack();
    one.use(new Resource("a"));
    one.use(new Failing("F"));
    one.use(new Resource("b"));
    let single = false;
    try {
        one.dispose();
    } catch (e) {
        single = e instanceof TypeError;
    }

    assert(single && trail == "bFa", "one failure, thrown as it is, and the rest disposed");

    // two failures: a SuppressedError of the newer, hiding the older
    trail = "";
    const two = new DisposableStack();
    two.use(new Failing("1"));
    two.use(new Failing("2"));
    let suppressed = false;
    try {
        two.dispose();
    } catch (e) {
        if (e instanceof SuppressedError) {
            const newer = e.error;
            const older = e.suppressed;
            suppressed = newer instanceof TypeError && older instanceof TypeError
                && (<TypeError>newer).message == "1" && (<TypeError>older).message == "2";
        }
    }

    assert(suppressed && trail == "21", "a SuppressedError holds both");

    console.log("ALL DONE");
}
