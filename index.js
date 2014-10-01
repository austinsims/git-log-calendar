var Q = require('q');
var ArgumentParser = require('argparse').ArgumentParser;
var Database = require('./database').Database;

var parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Generate a concise summary of work time and accomplishments from a Git repository and an Android Time Recording app database'
});

parser.addArgument(
    ['--db'],
    {
	help: 'The SQLite database provided by Time Recording',
	required: true
    }
);

parser.addArgument(
    ['-a', '--after'],
    {
	help: 'Date after which commits will be included'
    }
);

parser.addArgument(
    ['-b', '--before'],
    {
	help: 'Date before which commits will be included'
    }
);

var args = parser.parseArgs();
var db = new Database(args.db);

db.test().then(function(r) {
    console.log(r);
});

db.close();
