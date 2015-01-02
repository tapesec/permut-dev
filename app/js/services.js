'use strict';

/* Services */

var PermutantServices = angular.module('myApp.services', ['LocalStorageModule']);

PermutantServices.value('version', '0.1');

PermutantServices.constant('USER_STATUS',{
	banned: 0,
	granted: 1,
	admin: 10
});

PermutantServices.constant('RANDOM',{
	generate: function() {
		return Math.floor((Math.random() * 1000));
	}
});

PermutantServices.factory('Mail', ['$http', function($http){
	return {

		send: function(){
			return $http.get('/sendMail');
		}
	}
}]);



//Factory qui vérifie si un utilisateur a le droit d'acces a une page et bloque le changement de page le cas contraire
PermutantServices.factory('CheckAccess',['$rootScope', 'User', '$route', '$q', 
	function($rootScope, User, $route, $q){
		return function(){
			var start = $q.when('start');
			var checkRole = start.then(function(){
				var authorizedRoles = $route.current.authorizedRoles;
				if(!User.isAuthorized(authorizedRoles)){			
					if(User.isAuthenticated)
						return $q.reject("error:not-authorized");
					else
						return $q.reject("error:not-connected");
				}
			});
			return checkRole;
		}	
}]);

/**
*Service relatif à la création et à l'affichage des utilistaeurs du site
**/
PermutantServices.factory('User',['$http', '$location', 'localStorageService','$filter', function($http, $location, LocalStorageService, $filter){

	return {

		save : function(userData){

			$http.post('/addUser', userData);
		},
		update: function(userData){
			return $http.post('/updateUser', 
			{
				grade: userData.grade,
				dateEntree: userData.dateEntree,
				dateGrade: userData.dateGrade,
				ville: userData.ville,
				service: userData.service,
				presentation: userData.presentation,
				destination: userData.destination
			}).success(function(response){
					LocalStorageService.set('UserSession', response.content);
				});
		},
		login: function(credential){

			$http.post('/login', credential)
				.success(function(response){
					if(response.content){
						LocalStorageService.set('UserSession', response.content);
						$location.path('/index');
					}
				});
		},
		logout: function(){
			$http.get('/logout')
				.success(function(response){
					//ResponseInterpreter.translate(response.code);
					if(response.code != 'error:session-destroy'){
						LocalStorageService.remove('UserSession');
						$location.path('/login');
					}
				});
		},
		showAll: function(){

			return $http.get('/showAllUser');
				
		},
		showBy: function(type, val){
			return $http.get('/showBy/'+type+'/'+val);
		},
		showProfil: function(){
			var profil = this.get('UserSession');
			return profil;
		},
		getPassword: function(password){
			return $http.get('/getPassword/'+password);
		},
		countAll: function(){
			return $http.get('/countUser')
				.success(function(){}, function(error){
					console.error('Requete impossible vers le serveur veuillez réessayer');
				});
		},
		sendNewPassword: function(lost){
			$http.post('/retrievePassword', lost)
				.success(function(){
					$location.path('/login');
				});
		},
		sendAvatar: function(postdata) {
			return $http.post('/avatar', {img: postdata})
				.success(function(response) {
					return LocalStorageService.set('UserSession', response.content);
			});
			
		},
		get: function(key){
			if(this.isAuthenticated())
				return LocalStorageService.get(key);
		},
		isAuthenticated: function(){
    		return !!LocalStorageService.get('UserSession');
    	},
    	isAuthorized: function(authorizedRoles){
    		return (this.isAuthenticated() && authorizedRoles.indexOf(LocalStorageService.get('UserSession').status) !== -1);
    	}
	}
}]);

/**
*Service relatif à la gestion des villes
**/
PermutantServices.factory('Ville', ['$http','$q', function($http, $q){
	return {
		search: function(val){
			if(!!val){
				return $http.get('/getVilles/'+val);
			}else{
				return $q.when({data: {content:[]}});
			}
		}
	}
}]);

/**
*Service d'invocation de la requete de recherche de permutants
**/
PermutantServices.factory('Permutation', ['$http', function($http){

	return {

		search : function(params){
			return $http.post('/runCycle', params)
				.success(function(data){
					console.log('Resultat(s) bien chargé(s)');
					return data;
				})
				.error(function(error){
					return error;
				});
		},
		cycleIsAvailable: function(){
			return $http.get('/checkCycleAvailable');
		}
	}

}]);

PermutantServices.factory('Show', ['User', function(User){

	return {
		isVisible: function(item){
			switch(item){
				case 'connexion':
				case 'about':
					return !User.isAuthenticated();
					break;
				case 'profil':
				case 'deconnexion':
				case 'rechercheAuto':
				case 'rechercheMan':
					return User.isAuthenticated();
					break;
			}
		}
	};
}]);

 PermutantServices.factory('HttpInterceptor', ['$location', 'ResponseInterpreter','$rootScope', function($location, ResponseInterpreter, $rootScope) {
    
 	var currentRequestsCount = 0;
    return {

    	request: function(config) {
            currentRequestsCount++;
            $rootScope.$broadcast('loader:show');
            return config || $q.when(config)
        },

    	response: function(response){
    		if ((--currentRequestsCount) === 0) {
                $rootScope.$broadcast('loader:hide');
            }
            //console.log(response, 'http interceptor response');
            ResponseInterpreter.translate(response.data.code);
            return response || $q.when(response);
    	},
      	
    	responseError: function(rejection) {
    		console.log(rejection, 'http interceptor responseError');
    		if ((--currentRequestsCount) === 0) {
                $rootScope.$broadcast('loader:hide');
            }
	        ResponseInterpreter.translate(rejection.data.code);
	        return rejection || $q.when(rejection);
      	}
    };
  }]);


/**
*Service d'interpretation des reponses du serveur
**/
PermutantServices.factory('ResponseInterpreter', ['$location', 'localStorageService', function($location, LocalStorageService){
	return {

		iconeInfo: '<span class="glyphicon glyphicon-info-sign"></span> ',

		iconeError: '<span class="glyphicon glyphicon-remove"></span> ',

		class: ['humane-flatty-info', 'humane-flatty-error','humane-flatty-success'],

		translate : function(response){
			
			switch(response){
				case 'response:register-success':
					humane.log(this.iconeInfo+ 'Votre demande d\'inscription a bien été pris en compte, un mail de confirmation vous a été envoyé', { timeout: 3000, clickToClose: true, addnCls: this.class[2] });
					break;
				case 'response:login-success':
					humane.log(this.iconeInfo+ 'Utilisateur bien connecté !', { timeout: 3000, clickToClose: true, addnCls: this.class[2] });
					break;	
				case 'response:user-not-found':
					humane.log(this.iconeError+ 'Vous n\'êtes pas inscris !<br>Remplissez le formulaire d\'inscription en 4 lignes', { timeout: 3000, clickToClose: true, addnCls: this.class[1] });
					break;
				case 'response:users-load-success':
					console.log('Liste des utilisateurs bien chargé !');
					break;
				case 'response:session-destroy':
					humane.log(this.iconeInfo+ 'Aurevoir !', { timeout: 3000, clickToClose: true, addnCls: this.class[0] });
					break;
				case "response:update-user-success":
					humane.log(this.iconeInfo+ 'Profil bien mis à jour', { timeout: 3000, clickToClose: true, addnCls: this.class[2] });
					break;
				case "response:avatar-uploaded":
					humane.log(this.iconeInfo+ 'Avatar bien sauvegardé !', { timeout: 3000, clickToClose: true, addnCls: this.class[2] });
					break;
				case "response:password-send":
					humane.log(this.iconeInfo+ 'Un mail de vérification vous a été envoyé', { timeout: 3000, clickToClose: true, addnCls: this.class[0] });
					break;
				case 'error:session-destroy':
					console.error('Une erreur est survenu dans la destruction de la session');
					break;	
				case 'response:already-exist':
					humane.log(this.iconeError+ 'Un utilisateur utilisant ce login ou cette adresse mail existe déjà !',{ timeout: 3000, clickToClose: true, addnCls: this.class[1] });
					break;
				case 'response:email-unknow':
					humane.log(this.iconeError+ 'Cette adresse email est inconnue',{ timeout: 3000, clickToClose: true, addnCls: this.class[1] });
					break;
				case 'response:password-found':
					console.log('mdp ok');
					break;
				case 'response:password-not-found':
					console.log('mdp inconnue');
					break;
				case 'response:users-countAll':
					console.log('nombre d\'inscris bien chargé !');
					break;
				case 'error:db-save':
					console.error('Erreur [save] veuillez réessayer');
					break;
				case 'error:db-find':
					console.error('Erreur [find] veuillez réessayer');
					break;
				case 'error:notAuthenticated':
					humane.log(this.iconeInfo+ 'Client non authentifié par le serveur veuillez réessayer, vous inscrire ou contacter l\'administrateur du site', { timeout: 3000, clickToClose: true, addnCls: this.class[1] });
					$location.path('/login');
	        		if(!!LocalStorageService.get('UserSession'))
	        			LocalStorageService.remove('UserSession');
					break;
				case 'error:not-authorized':
					console.error('Page non authorisé');
					break;
				case 'error:not-connected':
					console.error('Vous n\'êtes pas connecté');
					break;	
				/*default:
					console.log(response, 'Reponse du serveur inconnue');*/
			}
		}
	}
}]);

