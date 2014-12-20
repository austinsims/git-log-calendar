var exec = require('child_process').exec,
    Q = require('q'),
    util = require('util'),
    _ = require('underscore'),
    Util = require('./Util');

const RECORD_SEPARATOR = '\30';

function Git(pathToRepository, author) {
    this.pathToRepository = pathToRepository;
    this.author = author;

    // var command = "git log --author '%s' --format='%%cd %%s' --date=short --after '%s' --before '%s'"
    this.log = function(after, before) {
        var deferred = Q.defer();

        var command = [
            'git log',
            // TODO: Figure out if this should use commiter date (%cd) or author date (%ad) and name
            '--format='
                + quote([
                    '%ad',
                    '%s',
                    // If author not specified, grab that from commit to display later
                    author ? '' : '%an'
                ].join(RECORD_SEPARATOR)),
            '--date=short',
            after ? '--after=' + Util.quote(after) : '',
            before ? '--before=' + Util.quote(before) : '',
            this.author ? '--author=' + this.author : '',
        ].join(' ');
        console.log('cmd: ' + command);

        exec(
            command,
            {cwd: this.pathToRepository},
            function(err, stdout, stderr) {
                if (err || stderr) deferred.reject('Command "' + command + '" failed: ' + err || stderr);

                var log = _.chain(stdout.split('\n'))
                    .map(function(line) {
                        var fields = line.split(RECORD_SEPARATOR);
                        var idx = line.indexOf(' ');
                        return {
                            date: fields[0],
                            message: fields[1],
                            // this looks weird, but It puts the author in the commit object if an author
                            // wasn't explicitly specified, so that the messages can be attributed
                            author: author ? void 0 : fields[2]
                        };
                    })
                    .groupBy(function(commit) {
                        return commit.date;
                    })
                    .pairs()
                    .map(function(pair) {
                        var date = pair[0];
                        var commits = pair[1];
                        return [
                            date,
                            _.reduce(commits, function(memo, commit) {
                                return util.format(
                                    '%s%s\n',
                                    memo,
                                    // Prepend with author if showing commits from everyone
                                    (author ? '' : commit.author + ': ') + commit.message
                                );
                            }, '')
                        ];
                    })
                    .object()
                    .value();

                deferred.resolve(log);
            }
        )
        return deferred.promise;
    }
}

module.exports = Git;
