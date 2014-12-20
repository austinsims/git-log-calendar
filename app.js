var express = require('express'),
    ArgumentParser = require('argparse').ArgumentParser,
    path = require('path');

var parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Web API for the Git Log Calendar'
});

parser.addArgument(
    ['--port'],
    {
        help: 'Port to run HTTP server.  Defaults to 80.',
        defaultValue: 80,
        required: false
    }
)

var args = parser.parseArgs();

var app = express();

// Configuration
app.use(express.static(path.join(__dirname, "public")));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

// Routes
app.get('/hello', function(request, response) {
    response.send('Hello, world');
});

var server = app.listen(args.port, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Git Log Calendar server running at http://%s:%s', host, port);
});

server.on('error', function(error) {
    // TODO: print a more helpful error, like port in use, access denied, etc...
    console.error(error);
    process.exit(1);
});
