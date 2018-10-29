function fac(n, result = 1) {
    // base case
    if (n === 1) {
        console.trace()
      return result;
    }
  
    // compute the next result in the current stack frame
    const next = n * result;
  
    // propagate this result through tail-recursive calls
    return fac(n - 1, next);
  }
  fac(5)