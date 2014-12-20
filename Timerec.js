var Q = require('q'),
    _ = require('underscore'),
    moment = require('moment'),
    Database = require('./Database');

const DATE_FORMAT = 'M/D/YYYY';

function Timerec(databasePath) {
    var self = this;

    self.db = new Database(databasePath);

    this.dailySummary = function(before, after) {
        var beforeMoment, afterMoment;

        try {
            beforeMoment = moment(before, DATE_FORMAT);
            afterMoment = moment(after, DATE_FORMAT);
        } catch (ex) {
            throw new Error('Parsing either before (' + before + ') or after (' + after + ') failed.');
        }
        if (afterMoment.diff(before) >= 0) throw new Error('After must be after before.');

        var cur = afterMoment.clone();

        var dateRange = function(after, before) {
            var cur = after.clone();
            var range = [];
            while (before.diff(cur) >= 0) {
                range.push(cur.format(DATE_FORMAT));
                cur.add(1, 'day');
            }
            return range;
        }

        var totals = {};
        var promises = _.map(dateRange(afterMoment, beforeMoment), function(date) {
            return self.db.totalTimeForDate(date).then(function(total) {
                totals[date] = total;
            });
        });

        var deferred = Q.defer();
        Q.all(promises).then(function() {
            deferred.resolve(totals);
        });

        return deferred.promise;
    }
}

Timerec.getPossibleFormats = function() {
     return ;
}



var before, after;

module.exports = Timerec;
