var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var ImageSchema = Schema(
  {
  	img:{ data: Buffer, contentType: String },
  	user_id: {type: String, required : true},
  	file_name: {type: String, required: true}
  }
);
var Image = module.exports =  mongoose.model('Image',ImageSchema);