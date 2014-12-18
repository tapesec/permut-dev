//Schéma des données relatives aux permutants
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var permutantSchema = new Schema({
	ministere: { type: String },
	institution: { type: String },
	subCategory: { type: String },
	name: { type: String },
	email: { type: Schema.Types.Mixed },
	password: { type: Schema.Types.Mixed },
	avatar: { type: String, default: '/img/permut-nobody.svg'},
	grade: { type: String },
	dateAdmin: { type: Date },
	dateGrade: { type: Date },
	residence: { type: String },
	service: { type: String },
	description: { type: String },
	destination: { 
		choix1: { type: String },
		choix2: { type: String },
		choix3: { type: String }
	},
	dateInscription: { type: Date, default: Date.now },
	dateConnexion: { type: Date },
	lastSearch: { type: Date },
	status: { type: Number, default: 1 },
	tokken: { type: Schema.Types.Mixed },
	checked: { type: Boolean, default: false },
	ready: { type: Boolean, default: false},
	match: []
});

module.exports = mongoose.model('Permutant', permutantSchema);