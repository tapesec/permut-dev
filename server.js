//Chargement de la base de données et connexion via le module mongoose
var mongoose = require('mongoose');
var config = require('./config.json');
mongoose.connect('mongodb://'+config.mongoUrl+'/permutationDATA');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('Connecté à la base de données !');
});

//Modeles
var Permutant = require('./models/permutant');
var Ville = require('./models/ville');

//Modules
var sha1 = require('sha1');
var mkdirp = require('mkdirp');
var fs = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var formidable = require('formidable');
var express = require('express');
var app = express();
var MongoStore = require('connect-mongo')(session);
var nodemailer = require('nodemailer');
var moment = require('moment');
var momentRange = require('moment-range');
var Q = require('q');
var favicon = require('serve-favicon');
var path = require('path');
var multer  = require('multer');
var mkdirp = require('mkdirp');

var transporter = nodemailer.createTransport({
	service: 'Gmail',
	tls: {
		rejectUnauthorized: false
	},
	auth: {
		user: 'lionel.dupouy@gmail.com',
		pass: 'J1Z8K0G6C1G8N6'
	}
});

//Biblio persos
var beforeRegister = require('./lib/beforeRegister');
var beforeRender = require('./lib/beforeRender');
var selectBy = require('./lib/selectBy');
var isValid = require('./lib/isValid.js');
var pattern_validator = require('./lib/patternValidator');


//Configuration des urls
app.use(favicon(__dirname + '/app/img/favicon.ico'));
app.use('/lib', express.static(__dirname + '/app/lib'));
app.use('/img', express.static(__dirname + '/app/img'));
app.use('/js', express.static(__dirname + '/app/js'));
app.use('/lib', express.static(__dirname + '/app/lib'));
app.use('/css', express.static(__dirname + '/app/css'));
app.use('/partials', express.static(__dirname + '/app/partials'));
app.use('/fonts', express.static(__dirname + '/app/bower_components/bootstrap/fonts'));
app.use('/foo', express.static(__dirname + '/app/font'));
app.use('/data', express.static(__dirname + '/data'));
app.use('/bower_components', express.static(__dirname + '/app/bower_components'));
app.use('/images', express.static(__dirname + '/app/img'));
app.use('/avatars', express.static(__dirname + '/avatars'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(cookieParser());
app.use(multer({ dest: './uploads/'}))

//Configuration de la session et de son mode de stockage
app.use(session({ 
	store: new MongoStore({
		db: 'permutationDATA'
	}),
	secret: 'lovelace',
	resave: true,
	saveUninitialized: true 
}));


/**
*Midllewares de session
**/
function sessionCheck(req, res, next){
	if(req.session.userAuthenticated){
		next();
	}else{
		res.send(401, {code:"error:notAuthenticated"});
	}
}


//Lancement du serveur
var server = app.listen(config.port, function(){
	console.log('c\'est parti !');
});



app.get('/', function(req, res){
	res.setHeader('Content-type','text/html');
	res.sendfile(__dirname + '/app/index.html');
});



/*app.get('/splitAndSaveVille', function(req, res){
	var content = fs.readFileSync(__dirname+'/data/france.csv','UTF-8');
	var tmp = content.split('\n'); var tab = []; 
	var tmp2;
	console.log(tmp.length);
	for(var i=0; i<tmp.length; i++){
		if(tmp[i] !="" && tmp[i] != "\r\n"){
			tmp2 = tmp[i].split(",");
			var ville = {};
			for(j=0; j<tmp2.length;j++){
				switch(j){
					case 0:
					ville.cp = tmp2[j].replace('"', '');
					ville.cp = ville.cp.replace('"','');
					break;
					case 6:
					ville.ville = tmp2[j].replace('"', '');
					ville.ville = ville.ville.replace('"','');
					break;
					case 7:
					ville.reg = tmp2[j].replace('"', '');
					ville.reg = ville.reg.replace('"','');
					break;
					case 8:
					ville.nomReg = tmp2[j].replace('"', '');
					ville.nomReg = ville.nomReg.replace('"','');
					break;
					case 9:
					ville.dep = tmp2[j].replace('"', '');
					ville.dep = ville.dep.replace('"','');
					break;
					case 10:
					ville.nomDep = tmp2[j].replace('"', '');
					ville.nomDep = ville.nomDep.replace('"','');
					break;
					case 11:
					ville.longitude = tmp2[j].replace('"', '');
					ville.longitude = ville.longitude.replace('"','');
					break;
					case 12:
					ville.latitude = tmp2[j].replace('"', '');
					ville.latitude = ville.latitude.replace('"','');
					break;	

				}
			}
			tab.push(ville);
		}
	}
	console.log(tab);
	for(var i=0;i<tab.length;i++){
		var ville = new Ville(tab[i]);
		ville.save(function(error){
			if(error)
				console.error(error);
		});
	}
	
	res.send('ok ville');
});



/**
* Connexion à l'application monager en passant un couple login mot de passe entrainant une vérification dans la base de données
**/
app.post('/login', function(req, res){

	//var candidate = beforeRegister(req.body);
	if(!isValid(pattern_validator.login, req.body)) {
		res.status(400).send('Bad Request');
	} else {
		var query = Permutant.findOne({name: req.body.login, password: sha1(req.body.password), checked: true})
		.select('name').select('._id').select('status').select('residence')
		.select('grade').select('dateAdmin').select('dateGrade').select('service')
		.select('description').select('destination').select('dateConnexion')
		.select('status').select('email').select('match').select('ready').select('avatar');

		query.exec(function(error, user){
			if(error){
				res.status(500).send({ code: 'error:db-find' });
			}else{
				if(user){
					req.session.userAuthenticated = {
						_id: user._id,
						name: user.name,
						status: user.status
					}
					console.log(user);
					res.status(200).send({ code: 'response:login-success', content: beforeRender(user) });
				}else{
					res.status(200).send({ code: 'response:user-not-found' });
				}
			}
		});
	}
});

/**
* Déconnexion de l'application et destruction de la session utilisateur stocké dans mongodb
**/
app.get('/logout', [sessionCheck], function(req, res){
	var login = req.session.userAuthenticated.name;
	req.session.destroy(function(error) {

		if(error){
			console.log('Erreur de destruction de la session de '+login);
			res.send({ code: 'error:session-destroy'});
		}else{
			console.log('La session de '+login+' a bien été détruite');
			res.send({code: 'response:session-destroy'});
		}
	});
});

/**
* Mise à jour du profil utilisateur
**/
app.post('/updateUser', [sessionCheck], function(req, res){
	console.log(req.body);
	if (!isValid(pattern_validator.updateUser, req.body)) {
		res.status(400).send('Bad Request');
	} else {
		var userData = beforeRegister(req.body);
		console.log(userData);
		var query = Permutant.findOneAndUpdate({_id: req.session.userAuthenticated._id}, userData);
		query.exec(function(error, user){
			var beforeRenderUser = beforeRender(user);
			if(error){
				console.error(error, 'Erreur de mis à jour d\'un utilisateur');
				var message = "error:db-update";
				res.status(500);
			}else{
				console.log('Utilisateur: '+userData.ready+' bien mis à jour !');
				var message = "response:update-user-success";
				res.status(200);
			}
			res.send({code:message, content: beforeRenderUser});
		});
	}
});

/**
*Sauvegarde un permutant en base de données
**/
app.post('/addUser', function(req, res){

	if (!isValid(pattern_validator.signIn, req.body)) {
		res.status(400).send('Bad Request');
	} else {
		var query = Permutant.find();
		var dataToSave = beforeRegister(req.body);
		query.where({name: dataToSave.name});
	  	//query.or([{name: dataToSave.name},{email: dataToSave.email}]);
	  	query.exec(function(error, users){
		  	if(error){
		  		console.error(error, 'Erreur de recherche d\'un utilisateur');
		  		res.status(500).send({ code: 'error:db-find' });
		  	}else{
		  		if(users.length > 0){
		  			res.status(409).send({ code: 'response:already-exist' });
		  		}else{
		  			dataToSave.tokken = dataToSave.password+sha1(dataToSave.email);
		  			var permutant = new Permutant(dataToSave);
		  			permutant.save(function(error){
		  				if(error){
		  					res.status(500).send({ code:"error:db-save"});
		  				}else{
							// NB! No need to recreate the transporter object. You can use
							// the same transporter object for all e-mails
							// setup e-mail data with unicode symbols
							var mailOptions = {
							    from: 'nodereply@permut.com', // sender address
							    to: dataToSave.email, // list of receivers
							    subject: '[Permut.com] Confirmation d\'inscription', // Subject line
							    html: 'Vous recevez cet email car vous souhaitez vous inscrire à Permut.com,<br>'+
							    'si vous êtes bien l\'auteur de la demande, cliquez sur le lien ci dessous pour valider vore inscription puis rendez vous sur le site pour vous connecter<br>'+
							    '<a href="http://'+config.domaineUrl+':'+config.port+'/validInscription/'+dataToSave.tokken+'">Je clique ici pour valider mon inscription !</a>' // plaintext body   
							};
							// send mail with defined transport object
							transporter.sendMail(mailOptions, function(error, info){
								if(error){
									console.log(error);
									res.status(500).send({ code:"error:internal"});
								} else {
									res.status(200).send({ code: "response:register-success" });
								}
							});
						}
					}); 
		      	}//enfif user.length
		    }//endif error
	  	});//end query exec
	}//endif
});//end app.post

app.get('/removeUser', [sessionCheck], function(req, res){
	console.log(req.session.userAuthenticated);
	var query = Permutant.findOne();
	query.where({name: req.session.userAuthenticated.name});
	query.exec(function(err, user) {
		console.log(user, 'user ligne 312');
		Permutant.remove({name: user.name}, function(err) {
			if(err){
			  	console.error(err, 'Erreur de suppression');
			  	res.status(500).send({ code: 'error:db-remove' });
			}
			if( user.avatar != '/img/permut-nobody.svg') {
				fs.exists(__dirname + user.avatar, function(exist) {
					if ( exist ) {
						fs.unlink(__dirname + user.avatar, function (err) {
							if(err) {
								console.log(err);
								res.status(500).send({ code: 'error:db-remove' });
							}
							res.status(200).send({ code: 'response:delete-success' });
							console.log('successfully deleted');
						});
					} else {
						console.error(err, 'Le chemin n\'existe pas');
				  		res.status(500).send({ code: 'error:db-remove' });
					}
				});
			} else {
				res.status(200).send({ code: 'response:delete-success' });
				console.log('successfully deleted');
			}
		});
	});
});

/**
* Sauvegarde l'avatar de l'utilisateur en base de données
* @TODO proteger l'upload
**/
app.post('/avatar', [sessionCheck], function(req, res){
	console.log(req.body.img);

	var imgData = req.body.img,
	base64Data = imgData.replace(/^data:image\/png;base64,/,""),
  	binaryData = new Buffer(base64Data, 'base64').toString('binary'); 
	var login = req.session.userAuthenticated.name;
	var folder = login.substr(0,1);
	//var rand = Math.floor((Math.random() * 1000) + 1);
	
	mkdirp(__dirname + '/avatars/'+ folder, function(error) {
		fs.writeFile(__dirname +"/avatars/"+folder+"/"+login/*+rand*/+".png", binaryData, "binary", function(err) {
	  		console.log(err); // writes out file without error, but it's not a valid image
	  		var query = Permutant.findOneAndUpdate({_id: req.session.userAuthenticated._id}, {avatar: '/avatars/'+folder+'/'+login/*+rand*/+'.png'});
			query.exec(function(error, user) {
				if(error) {
					res.status(500).send();
				} else {
					var data = beforeRender(user);
					res.status(200).send({code: "response:avatar-uploaded" , content : data});
				} 
			})
		});
	});
});


app.get('/validInscription/:tokken', function(req, res){

	var query = Permutant.findOneAndUpdate({tokken: req.params.tokken, checked: false},{checked: true});
	query.exec(function(error, user){
		if(error)
			res.sendfile(__dirname + '/app/partials/validation-inscription/validation-inscription-error.html');
		if(user)
			res.sendfile(__dirname + '/app/partials/validation-inscription/validation-inscription-success.html');
		else
			res.sendfile(__dirname + '/app/partials/validation-inscription/validation-inscription-error.html');
	});
});


/**
* Envoie un mail à l'adresse posté en paramètre pour demande à l'utilisateur de confirmer sa demande de recevoir un nouveau mot de passe
**/
app.post('/retrievePassword', function(req, res){

	if (!isValid(pattern_validator.retrievePassword, req.body)) {
		res.status(400).send('Bad Request');
	} else {
		var query = Permutant.findOne({email: req.body.email});
		query.exec(function(error, user){
			if(error){
				var message = {code: "error:db-find"};
			}else{
				if(user){
					var mailOptions = {
					    from: 'nodereply@permut.com', // sender address
					    to: user.email, // list of receivers
					    subject: '[Permut.com] Perte de votre mot de passe', // Subject line
					    html: 'Vous recevez cet email car vous avez perdu votre mot de passe et vous en demandez un nouveau,<br>'+
					    'si vous êtes bien l\'auteur de la demande, cliquez sur le lien ci dessous pour recevoir un nouveau mot de passe<br>'+
					    '<a href="http://'+config.domaineUrl+':'+config.port+'/validNewPassword/'+user.tokken+'">Je click ici pour recevoir un nouveau mot de passe !</a>' // plaintext body
					    
					};

					// send mail with defined transport object
					transporter.sendMail(mailOptions, function(error, info){
						if(error){
							console.log(error);
						}else{
							console.log('Message sent: ' + info.response);
						}
					});
					var message = {code: "response:password-send", content: "Un nouveau mot de passe vous a été envoyé (vérifiez vos spams)" };
				}else{
					var message = {code: "response:email-unknow"};
				}
				res.send(message);
			}
	});

	}
});


/**
* renvoie par mail un nouveau mot de passe à l'utilisateur
**/
app.get('/validNewPassword/:tokken', function(req, res){
		console.log(req.params);
		var cryptedPassword = sha1(req.params.tokken.substr(0,8));
		var query = Permutant.findOneAndUpdate({tokken: req.params.tokken}, {password: cryptedPassword});
		query.exec(function(error, user){
			if(error){
				res.status(500).send('Ce lien n\'existe pas !');
			}else{
				if(user){
					var mailOptions = {
					    from: 'nodereply@permut.com', // sender address
					    to: user.email, // list of receivers
					    subject: '[Permut.com] Nouveau mot de passe', // Subject line
					    html: 'Voici votre nouveau mot de passe : <strong>'+req.params.tokken.substr(0,8)+'</strong><br>'+
					    'Connectez vous avez votre login : <strong>'+user.name+'</strong> et ce mot de passe puis changez le rapidement<br>'+
					    '<a href="http://'+config.domaineUrl+':'+config.port+'">www.permut.com</a>'
					};

					// send mail with defined transport object
					transporter.sendMail(mailOptions, function(error, info){
						if(error){
							console.log(error);
						}else{
							console.log('Message sent: ' + info.response);
						}
					});
					res.status(200).send('Un nouveau mot de passe vous a été envoyé à '+user.email+' ,verifiez vos spams');
				}else{
					res.send('Ce lien n\'existe pas !');
				}
			}
		});
});


/**
* Retourne vrai ou faux si le mot de pass de la session a été retrouvé
**/
app.get('/getPassword/:pass', [sessionCheck], function(req, res){
	var pass = sha1(req.params.pass) || "";
	var query = Permutant.findOne();
	query.where({_id: req.session.userAuthenticated._id, password: pass});
	query.exec(function(error, user){
		if(error){
			var message = {code: "error:db-find"};
		}
		else{
			if(user){
				var message = {code: "response:password-found", content: true};
			}else{
				var message = {code: "response:password-not-found", content: false};
			}
		}
		res.send(message);
	});
});

/**
*Renvoie à l'application la liste des permutants
**
app.get('/showAllUSer', [sessionCheck], function(req, res){

	var query = Permutant.find();

	query.exec(function(error, users){
		if(error){
			var message = "error:db-find";
			res.send({ code: message });
		}else{
			if(users){
				var message = "response:users-load-success";
				res.send({ code: message, content: users });
			}
		}
	});
});*/

/**
* Retourne une liste d'utilisateur par type de recherche et en fonction des caractères passés en paramètre
*
**/
app.get('/showBy/:type/:val', [sessionCheck], function(req, res){
	var regex = /[\w\(\d\)_ -]/;
	if( regex.test(req.params.val) ) {
		var regex = new RegExp('^'+req.params.val);

		var query = Permutant.find();
		switch(req.params.type){
			case 'residence':
			query.where({residence: {$regex: regex, $options: 'i'}});
			break;
			case 'grade':
			query.where({grade: {$regex: regex, $options: 'i'}});
			break;
			case 'destination':
			query.or([{ "destination.choix1" : {$regex: regex, $options: 'i'}}, { "destination.choix2" : {$regex: regex, $options: 'i'}}, { "destination.choix3" : {$regex: regex, $options: 'i'}}]);
			break;
			default:
			res.status(400).Send();
		}
		query.exec(function(error, users){
			if(error){
				console.error(error);
				var message = "error:db-find";
				res.status(500).send({code: message});
			}else{
				if(users.length>0){
					console.log(users, 'villes');
					var message = "response:users-found";
					res.status(200).send({code: message, content: users});
				}else{
					console.error('user not found');
					var message = "response:users-not-found";
					res.status(200).send({code: message});
				}
			}
		});
	} else {
		res.status(400).send('bad request');
	}
});

/**
* Compte le nombre d'utilisateur en base de données
* @TODO Discriminer le comptage par corps de métier
**/
app.get('/countUser', function(req, res){
	var query = Permutant.count();
	query.exec(function(error, nbUser){
		if(error){
			var message = "error:db-count";
			res.send({code: message});
		}else{
			var message = "response:users-countAll";
			var nombre = (nbUser)? nbUser : 0;
			res.send({code:message, content: nombre});
		}
	});
});


/**
* Recherche une ville en fonction des caractères passés en paramètre
* @TODO filtrer :val
**/
app.get('/getVilles/:val', [sessionCheck], function(req, res){
	var regexvalue = /[\w\(\d\)_ -]/;
	if( !regexvalue.test(req.params.val) ) {
		res.status(400).send('bad request');
	} else {
		var regex = new RegExp('^'+req.params.val);
		var query = Ville.find();
		query.where({ville: { $regex: regex, $options: 'i'}}).sort('name').limit(20);
		query.exec(function(error, villes){
			if(error){
				console.error(error);
				var message = "error:db-find";
				res.send({code: message});
			}else{
				if(villes.length>0){
					console.log(villes, 'villes');
					var message = "response:villes-found";
					res.send({code: message, content: villes});
				}else{
					console.error('ville not found');
					var message = "response:villes-not-found";
					res.send({code: message});
				}
			}
		});
	}
});


/**
* Vérifie si l'utilisateur peut effectuer une recherche automatique
*
**/
app.get('/checkCycleAvailable', [sessionCheck], function(req, res){
	var request = Permutant.findOne({_id: req.session.userAuthenticated._id, ready: true});
	request.exec(function(error, user){
		if(error)
			var message = { code: "error:db-update"};
			res.status(500);
		if(user){
			console.log(moment.range(user.lastSearch, new Date()).diff('days'));
			if(moment.range(user.lastSearch, new Date()).diff('days') >= 1 || !user.lastSearch){
				var message = {code: "response:ok-run-cycle", content: true};
			}else{
				var message = {code: "response:forbidden-run-cycle", content: false};
			}
			res.status(200);
		}
		res.send(message);
	});
});


/**
*Algorithme de recherche de permutant en fonction des choix de postes exprimés
**/
app.post('/runCycle', [sessionCheck], function(req, res){

	/*var request = Permutant.findOneAndUpdate({_id: req.session.userAuthenticated._id}, {lastSearch: new Date()});
	request.exec(function(error){
		if(error){
			console.error(error);
			var message = "error:db-update";
			res.send({code: message});
		}
	});*/

var client = beforeRegister(req.body);

var combinaison = {
	bipartite: [],
	tripartite: [],
	quadrapartite: []
};

var permutantlvl2 = [], permutantlvl3 = [];

	/**
	* Récupère la liste des utilisateurs qui sont en poste au même endroit que un des trois choix du visiteur
	**/
	function firstRound() {
		var query;
		var deferred = Q.defer();
		query = Permutant.find();
		query.where({grade: client.grade});
		query.or([{ residence : client.destination.choix1 },
			{ residence : client.destination.choix2 },
			{ residence : client.destination.choix3 }]);

		query.exec(deferred.makeNodeResolver());
		return deferred.promise
	};

	/**
	* hydrate la liste des utilisateurs qui peuvent permuter avec le visiteur en bipartite et retourne la liste des résidence
	* ou tous ses utilisateurs souhaitent aller
	**/
	function setBipartite(users){
		console.log(users, 'liste des utilisateurs en poste là ou veux aller le visiteur');
		var deferred = Q.defer();
		if(!users || users.length == 0) {
			deferred.resolve(null);
		} else {
			var residencePossibility = [];
			for(user in users) {
				if(users[user].destination.choix1 == client.residence ||
					users[user].destination.choix2 == client.residence ||
					users[user].destination.choix3 == client.residence)
				{
					combinaison.bipartite.push({
						pos1: {
							login : 'vous',
							residence : client.residence,
							destination : client.destination,
							mail: client.email,
							service: client.service,
							description: client.description,
							dateAdmin: client.dateAdmin,
							dateGrade: client.dateGrade,
							grade: client.grade,
							avatar: client.avatar
						},

						pos2: {
							login : users[user].name,
							residence : users[user].residence,
							destination : users[user].destination,
							mail: users[user].email,
							service: users[user].service,
							description: users[user].description,
							dateAdmin: users[user].dateAdmin,
							dateGrade: users[user].dateGrade,
							avatar: users[user].avatar,
							grade: users[user].grade
						}
					});
				} else {
					residencePossibility.push({ residence : users[user].destination.choix1 });
					residencePossibility.push({ residence : users[user].destination.choix2 });
					residencePossibility.push({ residence : users[user].destination.choix3 });
					permutantlvl2.push(users[user]);
				}
				deferred.resolve(residencePossibility);
			}
		}
		return deferred.promise;
	}

	/**
	* Récupère la liste des utilisateurs qui sont en poste à un des lieu passés en paramètre
	**/
	function secondRound(residencePossibility) {
		console.log(residencePossibility,'possibilité de recherche d\'utilisateur du second tour');
		var query;
		var deferred = Q.defer();

		if(residencePossibility == null || residencePossibility.length == 0) {
			deferred.resolve(null);
		} else {
			query = Permutant.find();
			query.where({grade: client.grade});
			query.or(residencePossibility);	  	
			query.exec(deferred.makeNodeResolver());
		}
		return deferred.promise;
	}

	/**
	* hydrate la liste des utilisateurs qui peuvent permuter avec le visiteur en triipartite et retourne la liste des résidence
	* ou tous ses utilisateurs souhaitent aller.
	**/
	function setTripartite(users) {
		console.log(users, 'hydrate la liste des utilisateurs qui peuvent permuter avec le visiteur en triipartite et retourne la liste des résidence où tous ses utilisateurs souhaitent aller.');
		var deferred = Q.defer();
		if(!users || users.length == 0) {
			deferred.resolve(null);
		} else {
			var residencePossibility = [];		
			for(user in users){
				if(users[user].destination.choix1 == client.residence ||
					users[user].destination.choix2 == client.residence ||
					users[user].destination.choix3 == client.residence)
				{
					//console.log(users[user].name, 'name setTripartite');
					var multiplepos2 = [];
					for(perm in permutantlvl2){

						if(permutantlvl2[perm].destination.choix1 == users[user].residence ||
							permutantlvl2[perm].destination.choix2 == users[user].residence ||
							permutantlvl2[perm].destination.choix3 == users[user].residence)
						{
							multiplepos2.push({
								login : permutantlvl2[perm].name,
								residence : permutantlvl2[perm].residence,
								destination : permutantlvl2[perm].destination,
								mail: permutantlvl2[perm].email,
								service: permutantlvl2[perm].service,
								description: permutantlvl2[perm].description,
								dateAdmin: permutantlvl2[perm].dateAdmin,
								dateGrade: permutantlvl2[perm].dateGrade,
								avatar: permutantlvl2[perm].avatar,
								grade: permutantlvl2[perm].grade
							})
						}
					}
					combinaison.tripartite.push({
						pos1: {
							login : "Vous",
							residence : client.residence,
							destination : client.destination,
							mail: client.email,
							service: client.service,
							description: client.description,
							dateAdmin: client.dateAdmin,
							dateGrade: client.dateGrade,
							avatar: client.avatar,
							grade: client.grade
						},
						pos2 : multiplepos2,
						pos3: {
							login : users[user].name,
							residence : users[user].residence,
							destination : users[user].destination,
							mail: users[user].email,
							service: users[user].service,
							description: users[user].description,
							dateAdmin: users[user].dateAdmin,
							dateGrade: users[user].dateGrade,
							avatar: users[user].avatar,
							grade: users[user].grade
						},
						pos4: {
							login : "Vous",
							residence : client.residence,
							destination : client.destination,
							mail: client.email,
							service: client.service,
							description: client.description,
							dateAdmin: client.dateAdmin,
							dateGrade: client.dateGrade,
							avatar: client.avatar,
							grade: client.grade
						}
					});

				}else {
					residencePossibility.push({ residence : users[user].destination.choix1 });
					residencePossibility.push({ residence : users[user].destination.choix2 });
					residencePossibility.push({ residence : users[user].destination.choix3 });
					permutantlvl3.push(users[user]);
				}
			}
			deferred.resolve(residencePossibility);
			
		}
		return deferred.promise;
	}

	/**
	* Récupère la liste des utilisateurs qui sont en poste à un des lieu passés en paramètre
	**/
	function thirdRound(residencePossibility) {
		console.log(residencePossibility, 'thirdround');
		var query;
		var deferred = Q.defer();
		if(residencePossibility == null || residencePossibility.length == 0) {
			deferred.resolve(null);
		} else {
			query = Permutant.find();
			query.where({grade: client.grade});
			query.or(residencePossibility);	  	
			query.exec(function(error, users){
				if(error) deferred.reject(error);
				if(users) deferred.resolve(users);
			});
		}
		return deferred.promise;
	}

	/**
	* si existe, hydrate la liste des utilisateurs qui peuvent permuter avec le visiteur en quadrapartite et retourne la liste des résidence
	* ou tous ses utilisateurs souhaitent aller.
	**/
	function setQuadrapartite(users){
		console.log(users, 'setQuadrapartite');
		console.log(client, 'client');
		console.log(permutantlvl2, 'lvl2'); console.log(permutantlvl3, 'lvl3');
		console.log(users, 'users');

		var deferred = Q.defer();
		if(!users || users.length == 0) {
			deferred.resolve(null);
		} else {		
			//var residencePossibility = []; uniquement si on veut faire plus de quadra partite
			for(user in users){
				if(users[user].destination.choix1 == client.residence ||
					users[user].destination.choix2 == client.residence ||
					users[user].destination.choix3 == client.residence)
				{
					//console.log(users, 'match');
					var multiplepos3 = [];
					for(perm in permutantlvl3){
						if(permutantlvl3[perm].destination.choix1 == users[user].residence ||
							permutantlvl3[perm].destination.choix2 == users[user].residence ||
							permutantlvl3[perm].destination.choix3 == users[user].residence)
						{
							console.log('OKKKKKKKKKKKKKKKK');
							//console.log(users, 'multiplepos2');
							var multiplepos2 = [];
							for(pperm in permutantlvl2){
								if(permutantlvl2[pperm].destination.choix1 == permutantlvl3[perm].residence ||
									permutantlvl2[pperm].destination.choix2 == permutantlvl3[perm].residence ||
									permutantlvl2[pperm].destination.choix3 == permutantlvl3[perm].residence)
								{
									//console.log(users, 'multiplepos1');
									multiplepos2.push({
										login : permutantlvl2[pperm].name,
										residence : permutantlvl2[pperm].residence,
										destination : permutantlvl2[pperm].destination,
										mail: permutantlvl2[pperm].email,
										service: permutantlvl2[pperm].service,
										description: permutantlvl2[pperm].description,
										dateAdmin: permutantlvl2[pperm].dateAdmin,
										dateGrade: permutantlvl2[pperm].dateGrade,
										avatar: permutantlvl2[pperm].avatar,
										grade: permutantlvl2[pperm].grade
									});
								}
							}
							multiplepos3.push({
								login : permutantlvl3[perm].name,
								residence : permutantlvl3[perm].residence,
								destination : permutantlvl3[perm].destination,
								mail: permutantlvl3[perm].email,
								service: permutantlvl3[perm].service,
								description: permutantlvl3[perm].description,
								dateAdmin: permutantlvl3[perm].dateAdmin,
								dateGrade: permutantlvl3[perm].dateGrade,
								avatar: permutantlvl3[perm].avatar,
								grade: permutantlvl3[perm].grade
							});
						} // endif
					}
					combinaison.quadrapartite.push({
						pos1: {
							login : 'Vous',
							residence : client.residence,
							destination : client.destination,
							mail: client.email,
							service: client.service,
							description: client.description,
							dateAdmin: client.dateAdmin,
							dateGrade: client.dateGrade,
							avatar: client.avatar,
							grade: client.grade
						},
						pos2: multiplepos2,
						pos3: multiplepos3,
						pos4: {
							login : users[user].name,
							residence : users[user].residence,
							destination : users[user].destination,
							mail: users[user].email,
							service: users[user].service,
							description: users[user].description,
							dateAdmin: users[user].dateAdmin,
							dateGrade: users[user].dateGrade,
							avatar: users[user].avatar,
							grade: users[user].grade
						},
						pos5: {
							login : 'Vous',
							residence : client.residence,
							destination : client.destination,
							mail: client.email,
							service: client.service,
							description: client.description,
							dateAdmin: client.dateAdmin,
							dateGrade: client.dateGrade,
							avatar: client.avatar,
							grade: client.grade
						}
					}); // endfor
				} // endif
			}
			deferred.resolve("fini"); // endfor	
		}
		return deferred.promise;
	}

	Q().then(firstRound)
	.then(setBipartite)
	.then(secondRound)
	.then(setTripartite)
	.then(thirdRound)
	.then(setQuadrapartite)
	.then(function(users, error){
			console.log(permutantlvl2, 'lvl2'); console.log(permutantlvl3, 'lvl3');
			console.log(combinaison, 'combo');
			if(combinaison.bipartite.length == 0 && combinaison.tripartite.length == 0 && combinaison.quadrapartite.length == 0) {
				res.status(200).send('no match');
			} else {
				res.status(200).send(combinaison);
			}
		})
	.catch(function(err){
		console.log('in error : ', err);
	});
});