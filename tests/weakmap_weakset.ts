// gc only: WeakMap and WeakSet are built on the collector's weak links, and this calls GC_gcollect().
class Key {
    constructor(public id: int) {
    }
}

// in a function of its own, so the key does not stay in the caller's frame
function addDropped(map: WeakMap<Key, string>, set: WeakSet<Key>, refs: WeakRef<Key>[], id: int) {
    const key = new Key(id);
    map.set(key, "dropped");
    set.add(key);
    refs.push(new WeakRef<Key>(key));
}

function basics() {
    const a = new Key(1);
    const b = new Key(2);
    const twin = new Key(1);

    const map = new WeakMap<Key, int>();
    assert(!map.has(a) && map.get(a) == undefined, "an empty map has nothing");
    assert(map.set(a, 10) == map, "set returns the map");
    map.set(b, 20);
    assert(map.get(a) == 10 && map.get(b) == 20, "get gives what was set");
    assert(!map.has(twin), "keys are compared by identity");
    map.set(a, 11);
    assert(map.get(a) == 11, "set again replaces the value");
    assert(map.delete(a), "delete of a key that is there");
    assert(!map.has(a) && map.get(a) == undefined, "gone after delete");
    assert(!map.delete(a), "delete of a key that is not there");
    assert(map.get(b) == 20, "the other key stays");
    map.set(a, 12);
    assert(map.get(a) == 12, "a deleted key can be set again");

    const set = new WeakSet<Key>();
    assert(!set.has(a), "an empty set has nothing");
    assert(set.add(a) == set, "add returns the set");
    assert(set.has(a) && !set.has(b), "has after add");
    assert(set.delete(a) && !set.has(a) && !set.delete(a), "delete");

    const fromEntries = new WeakMap<Key, int>([[a, 1], [b, 2]]);
    assert(fromEntries.get(b) == 2, "made from entries");
    const fromValues = new WeakSet<Key>([a, b]);
    assert(fromValues.has(a) && fromValues.has(b), "made from values");

    // past the size at which set looks for dead entries, with every key still held
    const held: Key[] = [];
    const many = new WeakMap<Key, int>();
    for (let i = 0; i < 200; i++) {
        const key = new Key(i);
        held.push(key);
        many.set(key, i * 2);
    }

    for (let i = 0; i < 200; i++) {
        assert(many.get(held[i]) == i * 2, "live keys survive the sweeps");
    }
}

function collected() {
    const kept = new Key(7);
    const map = new WeakMap<Key, string>();
    const set = new WeakSet<Key>();
    map.set(kept, "kept");
    set.add(kept);

    const refs: WeakRef<Key>[] = [];
    for (let i = 0; i < 1000; i++) {
        addDropped(map, set, refs, i);
    }

    GC_gcollect();
    GC_gcollect();

    // not all of them: the collector scans the stack conservatively, and a stray word there can keep
    // one alive
    let cleared = 0;
    for (const ref of refs) {
        if (ref.deref() == undefined) cleared++;
    }

    assert(cleared >= 900, "the map and the set do not keep their keys alive");
    assert(map.get(kept) == "kept", "a held key keeps its value");
    assert(set.has(kept), "a held key stays in the set");
}

function main() {
    basics();
    collected();
    console.log("ALL DONE");
}
