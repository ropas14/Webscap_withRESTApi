//Import the mongoose module
var mongoose = require('mongoose');
//Set up default mongoose connection
var mongoDB = 'mongodb://localhost:27017/Sites';
mongoose.connect(mongoDB);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
//Define a schema
var Schema = mongoose.Schema;
var CleanserSchema = new Schema({
   url: String,
   brand: String,
   category: String,
   ingredients: Array,
   Corcerns: Array,
});
// Compile model from schema
var requiredData = mongoose.model('FacialCleansers', CleanserSchema);
exports.saveData = function(item) {
   var data = new requiredData(item);
   var promise = data.save();
   return promise;
}
exports.closeConnection = function() {
   db.close();
}