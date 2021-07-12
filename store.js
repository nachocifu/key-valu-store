const net = require('net');
// store map for key-value
map = new Map();
// metrics storage
metrics = new Map([
    ['gets', 0],
    ['sets', 0],
    ['deletes', 0],
    ['sessions', 0],
    ['history', new Array(50)],
]);

const store = net.createServer((c) => {

    c
        .on('error', err => console.log(err))
        .on('data', function (data) {
            // on empty input, do nothing
            if (data.toString().trim().length === 0) return;

            // parse tcp stream for multiple commands
            data = data.toString().trim().split(/\n/);

            // evaluate line
            data.forEach(line => evaluate(c, line));
        });
    incrementMetric('sessions', 1);
});

/**
 * Evaluates input and writes to socket accordingly
 * @param c Net.Socket
 * @param data String
 */
function evaluate(c, data) {
    // READ
    let command = data.toString()
        .replace(/\s+/, ' ')
        .split(/\s/)
    ;
    // console.log("SERVER input parsed: >"+command+"<")

    // EVALUATE
    switch (command[0].toUpperCase()) {
        case 'GET':
            if (command.length !== 2) {
                c.write("Invalid Input\n");
                break;
            }
            c.write(map.get(command[1]) + "\n");
            incrementMetric('gets', 1)
            logCommand(command)
            break;
        case 'SET':
            if (command.length !== 3) {
                c.write("Invalid Input\n");
                break;
            }
            map.set(command[1], command[2]);
            incrementMetric('sets', 1)
            logCommand(command)
            break;
        case 'DELETE':
            if (command.length !== 2) {
                c.write("Invalid Input\n");
                break;
            }
            map.delete(command[1]);
            incrementMetric('deletes', 1)
            logCommand(command)
            break;
        case 'EXIT':
            if (command.length !== 1) {
                c.write("Invalid Input\n");
                break;
            }
            c.end();
            logCommand(command)
            break;
        case 'METRICS':
            if (command.length !== 1) {
                c.write("Invalid Input\n");
                break;
            }
            c.write(JSON.stringify([...metrics]) + "\n");
            logCommand(command)
            break;
        default:
            c.write("Invalid Input\n");
    }
}

function incrementMetric(key, value) {
    metrics.set(key, metrics.get(key) + value);
}

/**
 * Logs history for latest N commands
 * @param command
 */
function logCommand(command) {
    let elem = metrics.get('history');
    elem.unshift(command);
    elem.pop();
}

module.exports = store;
