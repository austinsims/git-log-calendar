var ArgumentParser = require('argparse').ArgumentParser,
    _ = require('underscore'),
    Timerec = require('./Timerec')
    moment = require('moment')
    Git = require('./Git');

var possibleFormats = ['rounded', 'decimal', 'exact'];
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

parser.addArgument(
    ['-r', '--repo'],
    {
        help: 'Path to Git repository. Defaults to current working directory.',
        defaultValue: '.',
        required: false
    }
);

parser.addArgument(
    ['--author'],
    {
        help: 'Name of Git user whose commits you\'re interested in. If not specified, will list commits from all authors, with the committer\'s name prepended to each message.',
        required: false
    }
);

var args = parser.parseArgs();

if (!_.contains(possibleFormats, args.format)) {
    console.error('Format must be one of: ' + possibleFormats);
    process.exit(1);
}

var timerec = new Timerec(args.db);
timerec.dailySummary(args.before, args.after).then(function(summary) {
    // console.log(JSON.stringify(
    //     _.chain(summary)
    //         .pairs()
    //         .map(function(pair) {
    //             return [pair[0], formatDuration(pair[1], args.format)];
    //         })
    //         .object()
    //         .value(),
    //     void 0,
    //     4
    // ));
});

var git = new Git(args.repo, args.author);

git.log('2014-12-17', '2014-12-20')
    .then(function(out) { console.log(JSON.stringify(out, void 0, 4)); })
    .fail(function(why) { console.error(why); });















//
