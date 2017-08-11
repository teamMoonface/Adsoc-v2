var Employer = require('../models/employer');
var Student = require('../models/student');
var Job = require('../models/job');
var async = require('async');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var async = require('async');
var moment = require('moment');

//List of all jobs
exports.job_list = function(req, res, next) {    
	if(req.session.user){
		var store_User = req.session.user;
		async.parallel({
            jobCount: function(callback) {
                Job.count()
                    .exec(callback);
            },
            studentFunc: function(callback){
                Student.findById(req.session.user._id)
                        .exec(callback);
            }
        },function(err, results) {
          if (err) { return next(err); }
          console.log('store user');
          res.render('./Search_page', {title: 'Search Page', size: 5, student: results.studentFunc, store_User: 'session alive'});
        })
	}
	else if(req.session.emp){
		console.log(req.session.emp)
		var store_Emp = req.session.emp;
		async.parallel({
            jobCount: function(callback) {
                Job.count()
                    .exec(callback);
            },
            employerFunc: function(callback){
                Employer.findById(req.session.emp._id)
                        .exec(callback);
            }
        },function(err, results) {
          if (err) { return next(err); }
          res.render('./Search_page', {title: 'Search Page', size: 5, employer: results.employerFunc, store_Emp: 'session alive'});
        })		
	}
	else{
		async.parallel({
            jobCount: function(callback) {
                Job.count()
                    .exec(callback);
            }
        },function(err, results) {
          if (err) { return next(err); }
          res.render('./Search_page', {title: 'Search Page', size: 5});
        })
	}
};

exports.search = function(req, res, next) {
    res.render('./Search_page', {title: 'Search Page', store_User: (req.session.user == undefined ? null : 'session alive'), store_Emp: (req.session.emp == undefined ? null : 'session alive') });
}

// Filter + Search -- returns documents in JSON format
exports.search_result_JSON = function(req, res, next) {
    var searchString = req.body.searchPhrase;
    var type = req.body.search_type;
    var minRemun = req.body.remun;
    var skillTypeQuery = req.body.skill_type;
    var sortBy = req.body.sortBy;
    
    var page = parseInt(req.query.page),
        size = parseInt(req.query.size),
        skip = page > 0 ? (page-1)*size : 0;
    
    // search by job name
    if (type == 'job'){
        // non-empty search field
        if (searchString != '') {
            
            var options = {
                select: {score: {$meta: 'textScore'}},
                sort: sortBy == 'relevantRes' ? {score: {$meta:'textScore'}} : (sortBy == 'recentPosts' ? {'posted_date': -1} : {'remun': -1}),
                populate: 'employer',
                offset: skip,
                limit: size
            };
            
            Job.paginate({$and: [
                {remun: {$gte: minRemun}},
                {skill_type: skillTypeQuery != 'all' ? skillTypeQuery : {$in: ['Frontend', 'Backend', 'Fullstack']} },
                {$text: {$search: searchString, $caseSensitive: false, $diacriticSensitive: true}}]}, options,
                function(err, result){
                    if (err) { return next(err)};

                    var convertedJSON = JSON.parse(JSON.stringify(result.docs));
                    for (var i = 0; i < convertedJSON.length; i++) {
                        convertedJSON[i].url = result.docs[i].url;
                        convertedJSON[i].date_posted_formatted = result.docs[i].date_posted_formatted;
                        convertedJSON[i].date_start_formatted = result.docs[i].date_start_formatted;
                        convertedJSON[i].date_end_formatted = result.docs[i].date_end_formatted;
                        convertedJSON[i].employer = result.docs[i].employer.name;
                    }   

                    res.json({jobsList: convertedJSON, totalRecords: result.total});

                    // for testing & debugging
                    console.log("search type: " + type);
                    console.log("searched: " + searchString);
                    console.log("min remun: " + minRemun);
                    console.log("skill type: " + skillTypeQuery);
                    console.log("sort by: " + sortBy);
                    console.log('total records: ' + result.total);
                    console.log(convertedJSON);
            });
        }
        // empty search field
        else {
            
            var options = {
                select: {score: {$meta: 'textScore'}},
                sort: sortBy == 'relevantRes' ? {score: {$meta:'textScore'}} : (sortBy == 'recentPosts' ? {'posted_date': -1} : {'remun': -1}),
                populate: 'employer',
                offset: skip,
                limit: size
            };
            
            Job.paginate({$and: [
                {remun: {$gte: minRemun}},
                {skill_type: skillTypeQuery != 'all' ? skillTypeQuery : {$in: ['Frontend', 'Backend', 'Fullstack']} },
                ]}, options, function(err, result){
                    if (err) { return next(err)};

                    var convertedJSON = JSON.parse(JSON.stringify(result.docs));
                    for (var i = 0; i < convertedJSON.length; i++) {
                        convertedJSON[i].url = result.docs[i].url;
                        convertedJSON[i].date_posted_formatted = result.docs[i].date_posted_formatted;
                        convertedJSON[i].date_start_formatted = result.docs[i].date_start_formatted;
                        convertedJSON[i].date_end_formatted = result.docs[i].date_end_formatted;
                        convertedJSON[i].employer = result.docs[i].employer.name;
                    }   

                    res.json({jobsList: convertedJSON, totalRecords: result.total});

                    // for testing & debugging
                    console.log("search type: " + type);
                    console.log("searched: " + searchString);
                    console.log("min remun: " + minRemun);
                    console.log("skill type: " + skillTypeQuery);
                    console.log("sort by: " + sortBy);
                    console.log('total records: ' + result.total);
                    console.log(convertedJSON);
            });
        }
    }
    // search by employer
    else {
        var options = {
            populate: 'employer',
            sort: sortBy == 'relevantRes' ? (searchString == '' ? {'posted_date': -1} : null) : (sortBy == 'recentPosts' ? {'posted_date': -1} : {'remun': -1}),
            offset: skip,
            limit: size
        }
         async.waterfall([
            function(callback) {
                // non-empty search string
                if (searchString != '') {
                    Employer.find({$text: {$search: searchString, $caseSensitive: false, $diacriticSensitive: true}}, {score: {$meta: 'textScore'}}, '_id')
                            .sort({score: {$meta: 'textScore'}})
                            .exec(function(err, results) {
                                if (err) { return next(err); }
                                console.log('employers found: ' + results);
                                callback(null, results);
                             });
                }
                // empty search string
                else {
                    Employer.find()
                            .exec(function(err, results) {
                                if (err) { return next(err); }
                                console.log('employers found: ' + results);
                                callback(null, results);
                             });
                }
            },
            function(employers, callback) {
                Job.paginate({
                    $and: [
                        {remun: {$gte: minRemun}},
                        {skill_type: skillTypeQuery != 'all' ? skillTypeQuery : {$in: ['Frontend', 'Backend', 'Fullstack']} },
                        {'employer': {$in: employers}}
                    ]}, options, function(err, result) {
                        if (err) { return next(err);}
                        callback(null, result);
                    });
            }
        ], function (err, result) {
                if (err) { return next(err); }

                var convertedJSON = JSON.parse(JSON.stringify(result.docs));
                for (var i = 0; i < convertedJSON.length; i++) {
                    convertedJSON[i].url = result.docs[i].url;
                    convertedJSON[i].date_posted_formatted = result.docs[i].date_posted_formatted;
                    convertedJSON[i].date_start_formatted = result.docs[i].date_start_formatted;
                    convertedJSON[i].date_end_formatted = result.docs[i].date_end_formatted;
                    convertedJSON[i].employer = result.docs[i].employer.name;
                }   

                res.json({jobsList: convertedJSON, totalRecords: result.total});

                // for testing & debugging
                console.log("search type: " + type);
                console.log("searched: " + searchString);
                console.log("min remun: " + minRemun);
                console.log("skill type: " + skillTypeQuery);
                console.log("sort by: " + sortBy);
                console.log('total records: ' + result.total);
                console.log(convertedJSON);
            }            
        );
    }
};