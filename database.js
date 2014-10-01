var Q = require('q');
var fs = require('fs');
var sqlite3 = require('sqlite3');
var moment = require('moment');
var _ = require('underscore');

var Database = function(filename) {
    this.filename = filename;
    this.db = new sqlite3.Database(filename);

    this.hello = function() {
	return 'hello, world. lets operate on ' + this.filename;
    };

    this.close = function() {
	this.db.close();
    };

    this.test = function() {
	var deferred = Q.defer();
	var rows = [];
	this.db.each("SELECT * FROM T_STAMP_3 LIMIT 5",
		// Row received callback
		function(err, row) {
		    if (err) deferred.reject(new Error(err));
		    else rows.push(row);		   
		},
		// Transaction complete callback
		function (err, numRows) {
		    if (err) deferred.reject(new Error(err));
		    else deferred.resolve(rows);
		}
	);
	return deferred.promise;
    };
};

module.exports.Database = Database;
