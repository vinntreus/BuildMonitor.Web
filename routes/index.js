
/*
 * GET home page.
 */

exports.index = function(db){
	var buildData = db.getBuildData();
	console.log("data", buildData);
	return function(req, res){
		res.render('index', { title: 'Express', buildData : buildData });
	};	
};