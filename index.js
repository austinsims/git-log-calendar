var Q = require('q'),
    _ = require('underscore'),
    moment = require('moment'),
    ArgumentParser = require('argparse').ArgumentParser,
    Database = require('./database').Database;

const DATE_FORMAT = 'M/D/YYYY';

function formatDuration(hours, format) {
    if (!format) throw new Error("call to formatDuration must specify either 'rounded', 'decimal', or 'exact'")
	function roundUp(n) {
	    return (Math.round((n+7)/15) * 15) % 61;
	}
	var dur = moment.duration(hours, 'hours');
	switch (format) {
    	case 'decimal':
    	    return hours.toFixed(1);
    	case 'exact':
    	    return dur.hours() + ':' + dur.minutes();
    	case 'rounded':
    	    var min = roundUp(dur.minutes());
    	    var hr = dur.hours() + (min == 60 ? 1 : 0);
    	    return hr + ':' + (min == 60 ? '00' : min);
	}
}

var parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Generate a concise summary of work time and summary from a Git repository and an Android Time Recording app database'
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
    	help: 'Date after which commits will be included (MM/DD/YYYY)',
    	required: true
    }
);

parser.addArgument(
    ['-b', '--before'],
    {
    	help: 'Date before which commits will be included (MM/DD/YYYY)',
    	required: true
    }
);

parser.addArgument(
    ['-f', '--format'],
    {
    	help: 'Output format for hours. One of: rounded (6:45) exact (6:38) or decimal (6.75).  Defaults to decimal.',
    	defaultValue: 'decimal',
        required: false
    }
);

var args = parser.parseArgs();
var possibleFormats = ['rounded', 'decimal', 'exact'];
if (!_.contains(possibleFormats, args.format)) {
    console.error('Format must be one of: ' + possibleFormats);
    process.exit(1);
}

var db = new Database(args.db);

var before, after;
try {
    before = moment(args.before);
    after = moment(args.after);
} catch (ex) {
    console.error('Parsing either before (' + args.before + ') or after (' + args.after + ') failed.');
    process.exit(1);
}
if (after.diff(before) >= 0) throw new Error('After must be after before.');

var cur = after.clone();

(function printTimeForDate(cur) {
    db.totalTimeForDate(cur).then(function(sum) {
        console.log(cur.format(DATE_FORMAT) + ': ' + formatDuration(sum, args.format));
        if (before.diff(cur)) printTimeForDate(cur.add(1, 'day'));
    })
})(cur)
