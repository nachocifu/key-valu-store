const net = require("net");
const store = require('./store.js')


let client;
let testPort = 3000;
beforeAll((done) => {
    store
        .on('error', (err) => {
            console.log(err);
        })
        .on('listening', () => {
            client = new net.Socket();
            client.connect({port: testPort})
                .on('connect', done)
                .on('error', (err) => {
                    console.log(err);
                });
        });
    store.listen(testPort, 'localhost');
});

/**
 * Reset client as listeners from different tests start overlapping.
 * client.removeListeners function would require per function resetting
 */
afterEach((done) => {
    client.end();
    client = new net.Socket();
    client.connect({port: testPort})
        .on('connect', done)
        .on('error', (err) => {
            console.log(err);
        });
});

afterAll(() => {
    client.destroy();
    store.close();
});

test('Unset element should Get as undefined', done => {
    client.on('data', data => {
        expect(data.toString().trim()).toBe("undefined");
        done();
    })
    client.write('get c');
});

test('Set element and then retrieve same element', (done) => {
    client.on('data', data => {
        expect(data.toString().trim()).toBe("3");
        done();
    })
    client.write('set b 3\n', function () {
        client.write('get b\n');
    })
});

test('Set element and then retrieve same element (alphanum)', (done) => {
    client.on('data', data => {
        expect(data.toString().trim()).toBe("34sdfs32ff23");
        done();
    })
    client.write('set b 34sdfs32ff23\n', function () {
        client.write('get b\n');
    })
});

test('Set element and then retrieve same element (symbols)', (done) => {
    client.on('data', data => {
        expect(data.toString().trim()).toBe("34sd-fs45@#ff%2+-_=1==1@*3");
        done();
    })
    client.write('set b 34sd-fs45@#ff%2+-_=1==1@*3\n', function () {
        client.write('get b\n');
    })
});

test('Set element and then retrieve same element (command)', (done) => {
    client.on('data', data => {
        expect(data.toString().trim()).toBe("exit();");
        done();
    })
    client.write('set b exit();\n', function () {
        client.write('get b\n');
    })
});

test('Set element and then retrieve same element (no value)', (done) => {
    client.on('data', data => {
        expect(data.toString().trim()).toBe("Invalid Input");
        done();
    })
    client.write('set b\n')
});

test('After deleting element should return undefined', (done) => {
    client.on('data', data => {
        expect(data.toString().trim()).toBe("undefined");
        done();
    })
    client.write('set b 3\n', () => client.write('delete b\n', () => client.write('get b\n')));
});

test('Exit session', (done) => {
    client.on('end', done);
    client.write('set b 3\n', () => client.write('exit\n'));
});

test('Get element after another client update should return new value', (done) => {
    let client2 = new net.Socket();
    client2.connect({port: testPort}).on('error', (err) => console.log(err));
    client.on('data', data => {
        expect(data.toString().trim()).toBe("6");
        done();
    });

    client2.on('connect', () =>
        client.write('set a 5\n', () =>
            client2.write('set a 6\n', () => { // drain event not getting dispatched
                client.write('get a\n')
            })
        )
    )
});

test('Get element after another client deletes should return \'undefined\'', () => {/*TODO*/
});
test('Get element that was set by another user', () => {/*TODO*/
});


