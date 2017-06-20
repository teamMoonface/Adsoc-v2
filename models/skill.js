var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SkillSchema = Schema(
    {
        name: {type: String, required: true}
    }
);

module.exports = mongoose.model('Skill', SkillSchema);