const net = require('net');
map = new Map();
const store = net.createServer((c) => {
    // TODO log client connected

    c
        .on('error', err => console.log(err))
        .on('data', function(data) {
        // on empty input, do nothing
        if(data.toString().trim().length === 0) return;

        // parse tcp stream for multiple commands
        data = data.toString().trim().split(/\n/);

        // evaluate line
        data.forEach(line => evaluate(c, line));
    });

});

function evaluate(c, data) {
    // READ
    let command = data.toString()
        .replace(/\s+/, ' ')
        .split(/\s/)
    ;
    // console.log("SERVER input parsed: >"+command+"<")

    // EVALUATE
    switch (command[0].toUpperCase()){
        case 'GET':
            if(command.length !== 2) {
                c.write("Invalid Input\n");
                break;
            }
            c.write(map.get(command[1])+"\n");
            break;
        case 'SET':
            if(command.length !== 3) {
                c.write("Invalid Input\n");
                break;
            }
            map.set(command[1], command[2]);
            break;
        case 'DELETE':
            if(command.length !== 2) {
                c.write("Invalid Input\n");
                break;
            }
            map.delete(command[1]);
            break;
        case 'EXIT':
            if(command.length !== 1) {
                c.write("Invalid Input\n");
                break;
            }
            c.end();
            break;
        default:
            c.write("Invalid Input\n");
    }
}

module.exports = store;
