var express = require('express'),
    ArgumentParser = require('argparse').ArgumentParser,
    path = require('path'),
    Git = require('./Git');

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

app.get('/log', function(request, response) {
    var git = new Git(request.query.repoPath, request.query.author)
    // TODO: Find a better pattern for making sense of the query string
    git.log(
        request.query.after,
        request.query.before,
        request.query.allBranches == 'true'
    ).then(function(log) {
        response.send(JSON.stringify(log));
    });
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
