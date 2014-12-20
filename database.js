var Q = require('q'),
    fs = require('fs'),
    sqlite3 = require('sqlite3'),
    moment = require('moment'),
    _ = require('underscore');

// Utility funcitons

function quote(s) {
    return '\'' + s + '\'';
};

function decimalHours(mmt) {
    return mmt.hours() + (mmt.minutes() / 60);
}

function promiseOfDeath(message) {
    var deferred = Q.defer();
    deferred.reject(message);
    return deferred.promise;
}

// Constants

const TABLE_NAME = 'T_STAMP_3';
const DATE_FMT = 'YYYY-MM-DD HH:mm:ss';
const CHECKIN_ACTION = '10';
const CHECKOUT_ACTION = '20';

var Database = function(filename) {
    this.db = new sqlite3.Database(filename);
    this.db.execSql = function(query) {
    	var deferred = Q.defer();
    	var rows = [];
    	this.each(query,
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

    this.close = function() {
    	this.db.close();
    };

    // Calculate the total hours worked on a given date
    this.rowsForDate = function(date) {
    	if (!date)
    	    return promiseOfDeath('No date passed to rowsForDate');
    	var start = moment(date).format(DATE_FMT);
    	var end = moment(date).add(1,'day').format(DATE_FMT);
    	var query = 'select * from T_STAMP_3 where STAMP_DATE_STR between ' + quote(start) + ' and ' + quote(end) + ';';
    	return this.db.execSql(query);
    };

    this.totalTimeForDate = function(date) {
    	var deferred = Q.defer();

    	this.rowsForDate(date)
    	    .then(function(rows) {
        		if (rows.length == 0)
        		    deferred.resolve(0);

        		var sum = _.chain(rows)
        			.map(function(row) {
        			    var hours = decimalHours(moment(row.STAMP_DATE_STR, DATE_FMT));
        			    // Map a checkin to a negative # of hours, and a checkout to a positive #
        			    if (row.CHECK_ACTION == CHECKIN_ACTION)
            				return -hours;
        			    else if (row.CHECK_ACTION == CHECKOUT_ACTION)
            				return hours;
        			    else return 0;
        			})
        			.reduce(function(memo, hours) {
        			    // Sum the mapped array for the daily worked hours
        			    return memo + hours;
        			})
        			.value();
        		deferred.resolve(sum);
    	    })
    	    .fail(function(err) {
        		deferred.reject(err);
    	    });

    	return deferred.promise;
    };
};

module.exports = Database;
