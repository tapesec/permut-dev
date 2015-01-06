(function(){

	//Validateur du formulaire de connexion
	exports.login = {
		login: {
			required: true,
			format: /^[\w@éèûîêïüëçà-]+$/
		},
		password: {
			required: true
		}
	};
	
	exports.updateUser = {
		grade: {
			required: true,
			format: /[Gardien de la Paix|Brigadier|Brigadier Chef|Major|Lieutenant|Capitaine|Commandant]/
		},
		dateEntree: {
			required: true
		},
		dateGrade: {
			required: true
		},
		ville: {
			required: true,
			format: /[ \w]{2,}(\()[\d]{5}(\))/
		},
		service: {
			required: true,
			format: /^[ \w@áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ',\.\/\(\)\^:_-]+$/
		},
		presentation: {
			required: true,
			format: /^[\s \w@áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ',\.\/\(\)\^:_-]+$/
		},
		destination: {
			choix1: {
				required: true,
				format: /[ \w]{2,}(\()[\d]{5}(\))/
			},
			choix2: {
				required: false,
				format: /[ \w]{2,}(\()[\d]{5}(\))/
			},
			choix3: {
				required: false,
				format: /[ \w]{2,}(\()[\d]{5}(\))/
			}
		},
		email: {
			required: true,
			format: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
		},
		password: {
			required: false
		}
	};
	//Validateur du formulaire d'inscription
	exports.signIn = {
		login: {
			required: true,
			format: /^[\w@éèûîêïüëçà-]+$/
		},
		email: {
			required: true,
			format: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
		},
		password: {
			required: true
		}
	};

	exports.retrievePassword = {
		email: {
			required: true,
			format: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
		}
	};
	

})();