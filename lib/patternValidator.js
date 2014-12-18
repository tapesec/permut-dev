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