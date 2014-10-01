var Q = require('q');
var _ = require('underscore');
var moment = require('moment');
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

// parser.addArgument(
//     ['-a', '--after'],
//     {
// 	help: 'Date after which commits will be included',
// 	required: true
//     }
// );

// parser.addArgument(
//     ['-b', '--before'],
//     {
// 	help: 'Date before which commits will be included',
// 	required: true
//     }
// );

parser.addArgument(
    ['--date'],
    {
	help: 'Date to calculate hours worked',
	required: true
    }
);

parser.addArgument(
    ['-f', '--format'],
    {
	help: 'Output format for hours. One of: rounded (6:45) exact (6:38) or decimal (6.75).  Defaults to decimal.',
	defaultValue: 'decimal'
    }
);

var args = parser.parseArgs();
var possibleFormats = ['rounded', 'decimal', 'exact'];
if (!_.contains(possibleFormats, args.format)) {
    console.error('Format must be one of: ' + possibleFormats);
    process.exit(1);
}

var db = new Database(args.db);

var date = args.date;

console.log('date: ' + date.toString());
//var date = '2014-08-15 00:00:00'

db.totalTimeForDate(new Date(date))
    .then(function(sum) {
	// Round a number of minutes up to 15 min intervals
	function roundUp(n) {
	    return (Math.round((n+7)/15) * 15) % 61;
	}
	
	var dur = moment.duration(sum, 'hours');
	switch (args.format) {
	case 'decimal':
	    console.log(sum);
	    break;
	case 'exact':
	    console.log('%d:%d', dur.hours(), dur.minutes);
	    break;
	case 'rounded':
	    var min = roundUp(dur.minutes());
	    var hr = dur.hours() + (min == 60 ? 1 : 0);
	    console.log('%d:%d', hr, min);
	    break;
	}
    })
    .fail(function(err) {
	console.error(err);
    });

db.close();
