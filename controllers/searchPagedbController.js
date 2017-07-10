var Employer = require('../models/employer');
var Student = require('../models/student');
var Job = require('../models/job');

var async = require('async');
var moment = require('moment'); 

//List of all jobs
exports.job_list = function(req, res, next) {
  Job.find()
    .populate('employer')
    .sort({'posted_date': -1})
    .exec(function (err, joblist) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('searchPage', { title: 'Browse Jobs', job_list: joblist });
    });
};

// Filter + Search
exports.search = function(req, res, next) {
    var searchString = req.body.searchPhrase;
    var type = req.body.search_type;
    var minRemun = req.body.remun;
    var skillTypeQuery = req.body.skill_type;
    var sortBy = req.body.sortBy;
    
    // search by job name
    if (type == 'job'){
        // non-empty search field
        if (searchString != '') {
            Job.find({
                $and: [
                    {remun: {$gte: minRemun}},
                    {skill_type: skillTypeQuery != 'all' ? skillTypeQuery : {$in: ['Frontend', 'Backend', 'Fullstack']} },
                    {$text: {$search: searchString, $caseSensitive: false} }
                ]}, {score: {$meta: 'textScore'}})
                .populate('employer')
                .sort(sortBy == 'relevantRes' ? {score: {$meta:'textScore'}} : (sortBy == 'recentPosts' ? {'posted_date': -1} : {'remun': -1}))
                .exec(function(err, results) {
                    if(err) { return next(err);}
                    res.render('searchPage', {title: 'Search Results', job_list: results, searchPhrase: searchString, skill_type: skillTypeQuery, remun: minRemun, type: type, sortBy: sortBy});
                
                    // for testing & debugging
                    console.log("search type: " + type);
                    console.log("searched: " + searchString);
                    console.log("min remun: " + minRemun);
                    console.log("skill type: " + skillTypeQuery);
                    console.log("sort by: " + sortBy);
                    console.log(results); 
                });
        }
        // empty search field
        else {
            Job.find({
                $and: [
                    {remun: {$gte: minRemun}},
                    {skill_type: skillTypeQuery != 'all' ? skillTypeQuery : {$in: ['Frontend', 'Backend', 'Fullstack']} } 
                ]})
                .populate('employer')
                .sort(sortBy == 'relevantRes' ? {'posted_date': -1} : (sortBy == 'recentPosts' ? {'posted_date': -1} : {'remun': -1}))
                .exec(function(err, results) {
                    if(err) { return next(err);}
                    res.render('searchPage', {title: 'Search Results', job_list: results, searchPhrase: searchString, skill_type: skillTypeQuery, remun: minRemun, type: type, sortBy: sortBy});
                
                    // for testing & debugging
                    console.log("search type: " + type);
                    console.log("searched: " + searchString);
                    console.log("min remun: " + minRemun);
                    console.log("skill type: " + skillTypeQuery);
                    console.log("sort by: " + sortBy);
                    console.log(results);  
                });
        }
                

    }
    // search by employer
    else {
        async.waterfall([
            function(callback) {
                // non-empty search string
                if (searchString != '') {
                    Employer.find({$text: {$search: searchString, $caseSensitive: false}}, {score: {$meta: 'textScore'}}, '_id')
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
                Job.find({
                    $and: [
                        {remun: {$gte: minRemun}},
                        {skill_type: skillTypeQuery != 'all' ? skillTypeQuery : {$in: ['Frontend', 'Backend', 'Fullstack']} },
                        {'employer': {$in: employers}}
                    ]})
                    .populate('employer')
                    .sort(sortBy == 'relevantRes' ? (searchString == '' ? {'posted_date': -1} : null) : (sortBy == 'recentPosts' ? {'posted_date': -1} : {'remun': -1}))
                    .exec(function(err, results) {
                        if (err) { return next(err); }
                        callback(null, results);
                    });
            }
        ], function (err, results) {
                if (err) { return next(err); }
                res.render('searchPage', {title: 'Search Results', job_list: results, searchPhrase: searchString, skill_type: skillTypeQuery, remun: minRemun, type: type, sortBy: sortBy});
            
                // for testing & debugging
                console.log("search type: " + type);
                console.log("searched: " + searchString);
                console.log("min remun: " + minRemun);
                console.log("skill type: " + skillTypeQuery);
                console.log("sort by: " + sortBy);
                console.log(results); 
            }            
        );    
    }
}