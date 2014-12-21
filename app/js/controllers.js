'use strict';

/* Controllers */

var PermutantCtrl = angular.module('myApp.controllers', []);

PermutantCtrl.controller('IndexCtrl', ['$rootScope', '$scope', 'User','Permutation', '$modal', function($rootScope, $scope, User, Permutation, $modal) {

	$scope.user = User.showProfil();

	Permutation.cycleIsAvailable().then(function(res){
		$scope.user.cycleAvailable = res.data.content;
	});

	$scope.open = function (infos) {

	    var modalInstance = $modal.open({
		    templateUrl: 'partials/popups/detail-poste.html',
		    controller: DetailPosteCtrl,
		    resolve: {
		      	infos: function(){
		      		return infos;
		      	}
		    }
	    });

	    function DetailPosteCtrl($scope, $modalInstance, infos) {
	    	
	    	$scope.infos = infos;
	    	console.log(infos);
	    	$scope.close = function(){
  				$modalInstance.close();
  			}
	    }
	};

  	/*
  	*Chargement de toute la liste des permutants
  	**
  	$scope.showAllUser = function(){
	  	User.showAll().then(function(response){
	  		$scope.users = response;
	  	});
	}

	/**
	*Recherche un permutant en fonction des choix de destination du demandeur
	**/
	$scope.searchAboutPermutation = function(){
		Permutation.search($scope.user).then(function(response){
			$scope.match = response.data;
		}, function(error){
			console.log(error);
		});
	}


}]);


PermutantCtrl.controller('ManualCtrl', ['$scope', 'User', function($scope, User) {

	$scope.type = "pasDeCritere";

	$scope.search = function(type, val){
		User.showBy(type, val).then(function(response){
			$scope.users = response.data.content;
		}, function(error){
			console.log(error);
		});
	}


}]);


PermutantCtrl.controller('NavBarCtrl', ['$scope','User','Show',  '$location', NavBarCtrl]);

	function NavBarCtrl($scope, User, Show, $location){
		
		/**
		*Rafraichissement de l'état de la navigation horizontale à chaque changement de vue
		**/
		$scope.$on('$routeChangeSuccess', function(event, curr, prev){
			$scope.nbUser = User.countAll().then(function(nb){
				$scope.nbUser = nb.data.content;
			});
			$scope.connexion = Show.isVisible('connexion');
			$scope.profil = Show.isVisible('profil');
			$scope.deconnexion = Show.isVisible('deconnexion');
			$scope.rechercheAuto = Show.isVisible('rechercheAuto');
			$scope.rechercheMan = Show.isVisible('rechercheMan');
		});

		/**
		*Déconnexion de l'utilisateur
		**/
		$scope.logout = function(){
			User.logout();
		}

		$scope.goHome = function() {
			$location.path('#/index');
		}

	}

/**
*Controlleur de gestion du chargement des pages
**/
PermutantCtrl.controller('LoaderCtrl', ['$scope', LoaderCtrl]);

	function LoaderCtrl($scope){
		$scope.loader = false;
		$scope.$on('loader:show', function(){
			$scope.loader = true;
		});
		$scope.$on('loader:hide', function(){
			$scope.loader = false;
		});
	}


PermutantCtrl.controller('AppCtrl', ['$rootScope', '$location', AppCtrl]);

	function AppCtrl($rootScope, $location){

		$rootScope.$on('$routeChangeError', function(event, curr, prev, rejected){	
			switch(rejected){
				case "error:not-authorized" || "error:not-connected":
					if(!!prev)
						$location.path(prev.originalPath);
					else
						$location.path('/login');
				break;			
				case "error:allready-connected":
					$location.path('/index');
				break;

			}
			
		});
	}

PermutantCtrl.controller('RegisterCtrl', ['$scope','User','$http','Mail', function($scope, User, $http, Mail){

	//Connexion
	$scope.login = {};
	//Inscription
	$scope.sign = {};
	//email pour le mot de passe perdu
	$scope.lost = {};
	$scope.confirm = {};

	//Captcha	
	$scope.captcha = {
		op1 : Math.floor((Math.random() * 10) + 1),
		op2 : Math.floor((Math.random() * 10) + 1),
		disabled : true
	}
	$scope.captcha.mustBe = $scope.captcha.op1 * $scope.captcha.op2 + 4;
			
	$scope.captchaObserver = function(result){
		$scope.captcha.disabled = (result != $scope.captcha.mustBe);
	}

	/**
  	*Sauvegarde l'utilisateur en base de donnée
  	**/
	$scope.register = function(){
		User.save($scope.sign);
	}

	$scope.connexion = function(){
		User.login($scope.login);
	}

	$scope.saveVille = function(){
  		$http.get('/splitAndSaveVille')
  			.success(function(res){
  				console.log(res);
  			});
  	}

  	$scope.retrivePassword = function(lost){
  		User.sendNewPassword(lost);
  	}
 
}]);

PermutantCtrl.controller('EditionCtrl', ['$scope', '$rootScope', 'User', '$filter','Ville', '$modal', '$http',
	function($scope, $rootScope, User, $filter, Ville, $modal, $http){
	
	$scope.profil = User.showProfil();
	
	$scope.listGrade = 'Gardien de la Paix, Brigadier, Brigadier Chef, Major, Lieutenant, Capitaine, Commandant'.split(',');

	//affichage / masquage des datepickers
	$scope.open = false;
	$scope.open2 = false;

	$scope.update = function(){
		if(!$scope.formProfil.$invalid) {
			User.update($scope.profil)
				.then(function(response){
					$scope.profil = response.data.content;
					$scope.formProfil.$setPristine();
				});
		}
	}

	$scope.search = function(val){
		Ville.search(val)
			.then(function(response){
				$scope.liste = response.data.content;
			});
	}

	$scope.getPassword = function(password){
		User.getPassword(password)
			.then(function(isvalid){
				$scope.passwordIsCorrect = isvalid.data.content;
			});
	}

	$scope.uploadAvatar = function() {

		var modalInstance = $modal.open({

			templateUrl: 'partials/popups/uploader.html',
			controller: function($scope, $modalInstance) {
				/*$scope.imageCropResult = null;
				$scope.showImageCropper = false;
				*/
				$scope.send = function() {
					var datauri = $(".result-datauri").val();
					$modalInstance.close(datauri);
				}

				$scope.close = function() {
					$modalInstance.close();
				}
			}

	   	});

	   	modalInstance.result.then(function (data) {
      		User.sendAvatar(data).then(function(result) {
				$scope.profil = User.showProfil();
			});	
    	});
	}


}]);

PermutantCtrl.controller('DetailPosteCtrl', function($scope, $modalInstance, infos) {

  	$scope.infos = infos;
  	$scope.close = function(){
  		$modalInstance.close();
  	}
});