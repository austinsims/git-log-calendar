var exec = require('child_process').exec,
    Q = require('q'),
    util = require('util'),
    _ = require('underscore'),
    Util = require('./Util');

const RECORD_SEPARATOR = '\30';

function Git(pathToRepository, author) {
    this.pathToRepository = pathToRepository;
    this.author = author;

    /// Maps dates in the range to a list of commits
    this.log = function(after, before, allBranches) {
        var deferred = Q.defer();

        var command = [
            'git log',
            allBranches ? '--all' : '',
            // TODO: Figure out if this should use commiter date (%cd) or author date (%ad) and name
            '--format='
                + [
                    '%cd',
                    '%s',
                    // If author not specified, grab that from commit to display later
                    '%cn'
                ].join(RECORD_SEPARATOR),
            '--date=short',
            after ? '--after=' + Util.quote(after) : '',
            before ? '--before=' + Util.quote(before) : '',
            this.author ? '--author=' + Util.quote(this.author) : '',
        ].join(' ');
        console.log('cmd: ' + command);

        exec(
            command,
            {cwd: this.pathToRepository},
            function(err, stdout, stderr) {
                if (err || stderr) {
                    deferred.reject('Command "' + command + '" failed: ' + err || stderr);
                    return;
                }

                var log = _.chain(stdout.split('\n'))
                    // Don't process the newline at the end
                    .filter(Boolean)
                    .map(function(line) {
                        var fields = line.split(RECORD_SEPARATOR);
                        var idx = line.indexOf(' ');
                        return {
                            date: fields[0],
                            message: fields[1],
                            author: fields[2]
                        };
                    })
                    .groupBy(function(commit) {
                        return commit.date;
                    })
                    .value();

                deferred.resolve(log);
            }
        )
        return deferred.promise;
    }
}

module.exports = Git;
