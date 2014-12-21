/// Given moments start and end, generate a list of moments
/// starting on start, ending on end, incrementing by one day.
function momentRange(start, end) {
    if (end.diff(start) < 0) throw new Error('Start must be less than end');
    var cur = start.clone();
    var range = [];
    while (cur.diff(end) <= 0) {
        range.push(cur.clone());
        cur.add(1, 'day');
    }
    return range;
}

function GitLogCalendar() {
    var self = this;

    self.DATE_FORMAT = 'YYYY-MM-DD';

    // form inputs
    self.after = ko.observable();
    self.before = ko.observable();
    self.repoPath = ko.observable('C:\\Users\\asims\\projects\\test-data-generator');
    self.author = ko.observable();
    self.allBranches = ko.observable(false);

    self.weeks = ko.observable();
    self.log = ko.observable();

    self.go = function() {
        // Don't do anything until both dates have been entered
        if (!(self.after() && self.before() && self.repoPath)) return;

        $.ajax('/log?' + $.param({
            before: self.before(),
            after: self.after(),
            repoPath: self.repoPath(),
            author: self.author(),
            allBranches: self.allBranches()
        }))
        .done(function(response) {
            self.log(JSON.stringify(JSON.parse(response), undefined, 4));
            var log = JSON.parse(response);

            var firstMonday = moment(self.after(), self.DATE_FORMAT).startOf('isoweek');
            var lastSunday = moment(self.before(), self.DATE_FORMAT).endOf('isoweek');
            var days = _.map(momentRange(firstMonday, lastSunday), function(day) {
                return {
                    date: day.format('MM/DD'),
                    commits: log[day.format('YYYY-MM-DD')]
                }
            });
            var weeks = [];
            // Break days into chunks of size 7
            while (days.length) weeks.push(days.splice(0,7));
            self.weeks(weeks);
        });
    }

    _.each([self.after, self.before, self.repoPath, self.author, self.allBranches], function(obs) {
        obs.subscribe(self.go);
    });

}

ko.applyBindings(new GitLogCalendar());
