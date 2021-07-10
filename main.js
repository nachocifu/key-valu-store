const net = require('net');
const { ArgumentParser } = require('argparse');
const { version, description } = require('./package.json');


/**
 * Handle arguments
 */
const parser = new ArgumentParser({
    description: description
});
parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('-p', '--port', { help: 'The listening port', default: '3000', type: 'int'});

let args = parser.parse_args();
let port = args['port'];
let map = null;

/**
 * Start server
 */
const server = net.createServer((c) => {
    // TODO log client connected

    c.on('data', function(data) {
        // on empty input, do nothing
        if(data.toString().trim().length === 0) return;

        // parse input
        var response = data.toString()
            .trim()
            .replace(/\s+/, ' ')
            .split(/\s/)
        ;

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

}).listen(port, () => { // TODO get port from cli
    map = new Map();
    console.log('Key-value store started. Listening on port '+port);
});

