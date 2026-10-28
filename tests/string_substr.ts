function main() {
    const s = "Mozilla";

    assert(s.substr(0, 1) == "M");
    assert(s.substr(1, 0) == "");
    assert(s.substr(-1, 1) == "a");
    assert(s.substr(1, -1) == "");
    assert(s.substr(-3) == "lla");
    assert(s.substr(1) == "ozilla");
    assert(s.substr(-20, 2) == "Mo");
    assert(s.substr(20, 2) == "");
    assert(s.substr(2, 100) == "zilla");

    // through the String wrapper
    const w = new String("Mozilla");
    assert(w.substr(2, 3) == "zil");

    console.log("ALL DONE");
}
