var async 			= require('async');
var createdDoc	= null;

var creatingDocAction = false;
exports.insertInDB 	= function(db){


async.doWhilst(
		function(callback){
			insertToDB(db);
			setTimeout(callback, 3000);
		},
		function(){
			return createdDoc == null;
		},
		function(err){
			if(!err){
				exports.createdDoc 	= createdDoc;


				creatingDocAction = false;
			}
		}
	);

};

function insertToDB(db){
if(!creatingDocAction){
		creatingDocAction = true;
}
var id='';

db.insert({
							dateTime: "abc"

}, id, function(err, doc) {


if(err) {
									console.log(err);
									//resp.sendStatus(500);
								} else{


createdDoc=doc;


}
})
};

