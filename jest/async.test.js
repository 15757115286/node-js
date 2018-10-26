const asyncTest = require('./async');
test('async test',()=>{
    expect.assertions(1);
    return asyncTest().then(data=>{
        expect(data).toBe(1);
    })
})