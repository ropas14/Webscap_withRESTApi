const express = require('express');
const app=express();
var mongDatabase = require("./saveCleansers")
app.get('/', (req, res) => {
	mongDatabase.getAllCleansers((err, cleansers) => {
		if(err){
			throw err;
		}
		res.json(cleansers);
	});
});
module.exports=app;
