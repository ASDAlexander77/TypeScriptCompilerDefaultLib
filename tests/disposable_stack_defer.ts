// DisposableStack.defer and adopt, which -mm=own takes too: callbacks run when the stack is disposed,
// last added first
let trail = "";

function main() {
    {
        using stack = new DisposableStack();
        stack.defer(() => { trail += "1"; });
        stack.defer(() => { trail += "2"; });
        const n = stack.adopt(4, (v: int) => { trail += v; });
        assert(n == 4, "adopt gives the value back");
    }

    assert(trail == "421", "at the end of the block, last first");

    const stack = new DisposableStack();
    stack.defer(() => { trail += "3"; });
    const moved = stack.move();
    moved.dispose();
    assert(trail == "4213" && stack.disposed && moved.disposed, "move, then dispose");

    console.log("ALL DONE");
}
