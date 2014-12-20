function GitLogCalendar() {
    var self = this;

    self.after = ko.observable('2014-12-17');
    self.before = ko.observable('2014-12-19');
    self.repoPath = ko.observable('/home/asims/projects/atom');
    self.author = ko.observable();
    self.allBranches = ko.observable(false);

    self.log = ko.observable();

    self.go = function() {
        $.ajax('/log?' + $.param({
            before: self.before(),
            after: self.after(),
            repoPath: self.repoPath(),
            author: self.author(),
            allBranches: self.allBranches()
        }))
        .done(function(response) {
            self.log(JSON.stringify(JSON.parse(response), undefined, 4));
        });
    }

}

ko.applyBindings(new GitLogCalendar());
