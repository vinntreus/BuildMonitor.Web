var moment = require("moment");
/*
 * GET home page.
 */

exports.index = function(db){
    var buildData = db.getBuildData().map(function(item){
      return [
        moment(item.Start).format(),
        item.Time
      ];
    });
    console.log(buildData);
    return function(req, res){
        res.render('index', { title: 'Express', buildData : buildData });
    };  
};