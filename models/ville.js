//Schéma des données relatives aux villes
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var villeSchema = new Schema({

	cp: { type: String },
	ville: { type: String },
	reg: { type: String },
	nomReg: { type: String },
	dep: { type: String },
	nomDep: { type: String },
	longitude: { type: Schema.Types.Mixed },
	latitude: { type: Schema.Types.Mixed }
});

module.exports = mongoose.model('Ville', villeSchema);