// Keys whose hash code is negative: a negative int, or a number with its sign bit set. The bucket
// index was the signed remainder, so it fell in front of the buckets and a lookup could spin.
function main() {
    const m = new Map<number, number>();
    for (let i = 1; i <= 50; i++) m.set(-i, i);
    let found = 0;
    for (let i = 1; i <= 50; i++) if (m.get(-i) == i) found++;
    assert(found == 50 && m.size == 50);
    assert(m.delete(-7) && !m.has(-7) && m.size == 49);

    const s = new Set<int>();
    for (let i = 1; i <= 50; i++) s.add(-i);
    let has = 0;
    for (let i = 1; i <= 50; i++) if (s.has(-i)) has++;
    assert(has == 50 && s.size == 50);
    assert(s.delete(-7) && !s.has(-7) && s.size == 49);

    console.log("ALL DONE");
}
