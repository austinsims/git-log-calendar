var child_process = require('child_process'),
    Q = require('q'),
    util = require('util'),
    _ = require('underscore');

function Git() {
    var command = "git log --author '%s' --format='%%cd %%s' --date=short --after '%s' --before '%s'"
    this.log = function(author, after, before) {
        var deferred = Q.defer();
        child_process.exec(
            util.format(command, author, after, before),
            function(err, stdout, stderr) {
                if (err || stderr) deferred.reject(err || stderr);

                var log = _.chain(stdout.split('\n'))
                    .map(function(line) {
                        var idx = line.indexOf(' ');
                        return {
                            date: line.substring(0,idx),
                            message: line.substring(idx+1)
                        };
                    })
                    .groupBy(function(commit) {
                        return commit.date;
                    })
                    .pairs()
                    .map(function(pair) {
                        var date = pair[0];
                        var commits = pair[1];
                        // pair: [date, [{date: message}, {date: message}]]
                        // return: [date, concatMessages]
                        return [
                            date,
                            _.reduce(commits, function(memo, commit) {
                                return util.format('%s%s\n',memo,commit.message);
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

module.exports = new Git();
