namespace __Array {
    function at<T>(this: T[], index: int): T {
        return this[index];
    }
}

static class Array {
    public of<T>(...arg: T[]) {
        return arg;
    }
}