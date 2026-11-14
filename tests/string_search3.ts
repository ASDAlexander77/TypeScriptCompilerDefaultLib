// search gives where the first match starts, whatever its length: it gave where the match ends, less
// one, which is right only for a match of one character
function main() {
    assert("abcdef".search(/cd/) == 2, "a match of two characters");
    assert("abcdef".search(/abc/) == 0, "a match at the start");
    assert("abcdef".search(/def/) == 3, "a match at the end");
    assert("abcdef".search(/x/) == -1, "no match");
    assert("abcdef".search(/f/) == 5, "a match of one character");
    assert("hello world".search(/o\s*w/) == 4, "a longer pattern");

    console.log("ALL DONE");
}
