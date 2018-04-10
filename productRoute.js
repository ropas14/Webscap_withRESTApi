const express = require('express');
const app=express();
var mongDatabase = require("./saveCleansers")// including the code to get json from mongo
app.get('/', (req, res) => {
	mongDatabase.getAllCleansers((err, cleansers) => {
		if(err){
			throw err;
		}
		res.json(cleansers);
	});
});
module.exports=app;
