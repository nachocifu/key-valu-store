const net = require('net');

let map = null;

const server = net.createServer((c) => {
    // TODO log client connected

    c.on('data', function(data) {
        // on empty input, do nothing
        if(data.toString().trim().length === 0) return;

        var response = data.toString()
            .trim()
            .split(/\s/)
        ;
        // TODO handle multiple whitespaces between key value and command

        switch (response[0].toUpperCase()){
            case 'GET':
                console.log("getting element "+ response[1]);
                c.write(map.get(response[1])+"\n");
                break;
            case 'SET':
                console.log("setting element "+ response[1]+"--->"+response[2]);
                map.set(response[1], response[2]);
                break;
            case 'DELETE':
                console.log("delete element "+ response[1]);
                map.delete(response[1]);
                break;
            case 'EXIT':
                console.log("exit store");
                c.end();
                break;
            default:
                c.write("Invalid Input\n");
        }
    });

}).listen(3000, () => {
    map = new Map();
    console.log('Key-value store started');
});

