const store = require('./store.js')
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



store.listen(port, () => {
    console.log('Key-value store started. Listening on port '+port);
});

