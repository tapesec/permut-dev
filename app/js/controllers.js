'use strict';

/* Controllers */

var PermutantCtrl = angular.module('myApp.controllers', []);

PermutantCtrl.controller('IndexCtrl', ['$rootScope', '$scope', 'User','Permutation', '$modal', 'Count', function($rootScope, $scope, User, Permutation, $modal, Count) {

	$scope.user = User.showProfil();

	$scope.nbUser = Count.data.content;
	

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


PermutantCtrl.controller('ManualCtrl', ['$scope', 'User', 'Count', function($scope, User, Count) {

	$scope.type = "pasDeCritere";
	$scope.input = {
		myplaceholder: "Tapez votre recherche ici"
	};
	$scope.nbUser = Count.data.content;

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
			$scope.nbUser = User.number;
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


PermutantCtrl.controller('AppCtrl', ['$rootScope', '$location','$scope', AppCtrl]);

	function AppCtrl($rootScope, $location, $scope){

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
		$scope.loader = {
			typeahead : false
		}
		$scope.$on('typeahead:hide', function(){
			$scope.loader.typeahead = false;
			console.log('false');
		});
		$scope.$on('typeahead:show', function(){
			$scope.loader.typeahead = true;
			console.log('true');
		});

	}

PermutantCtrl.controller('AboutCtrl', function() {


});

PermutantCtrl.controller('RegisterCtrl', ['$scope','User','$http','Mail','$location', function($scope, User, $http, Mail, $location){

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
		op2 : Math.floor((Math.random() * 10) + 1)
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

	/*$scope.saveVille = function(){
  		$http.get('/splitAndSaveVille')
  			.success(function(res){
  				console.log(res);
  			});
  	}*/

  	$scope.retrivePassword = function(lost){
  		User.sendNewPassword(lost);
  	}

  	$scope.savoir = function() {
  		$location.path('/about');
  	}
 
}]);

PermutantCtrl.controller('EditionCtrl', ['$scope', '$rootScope', 'User','Ville', '$modal', 'RANDOM', '$timeout',
	function($scope, $rootScope, User, Ville, $modal, RANDOM, $timeout){
	
	$scope.profil = User.showProfil();
	$scope.avatar = {
		randomparams : RANDOM.generate()
	}

	
	$scope.listGrade = 'Gardien de la Paix,Brigadier,Brigadier Chef,Major'.split(',');

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
			controller: 'ModalUploadCtrl',
			size: 'lg'
	   	});

	   	modalInstance.result.then(function (data) {
      		User.sendAvatar(data).then(function(result) {
      			$timeout(function() {
      				$scope.profil = User.showProfil();
					$scope.avatar.randomparams = RANDOM.generate();
      			});
				
			});	
    	});
	}

	$scope.lire = function () {

	    var modalInstance = $modal.open({
		    templateUrl: 'partials/popups/a-lire.html',
		    controller: AlireCtrl
	    });

	    function AlireCtrl($scope, $modalInstance) {
	    	$scope.close = function(){
  				$modalInstance.close();
  			}
	    }
	};

	$scope.modalDelete = function() {

		var modalInstance = $modal.open({
			template: 	'<div class="modal-header">'+
							'<h2 class="modal-title" id="myLargeModelLabel">C\'est le départ ?</h2>'+
						'</div>'+
						'<div class="modal-body">'+
							'<p>Êtes vous sure de vouloir vous désinscrire de père mut ? vous pourrez toujours vous réinscrire par la suite.</p>'+
							'Si c\'est parce que vous avez trouvé un permutant, félicitation et mission accompli !</p>'+
							'Sinon, j\'espère que ce n\'est pas suite à une deception venant du site.<br>Dans tous les cas ..</p>'+
							'.. bon vent ! <i class="fa fa-smile-o"></i>'+
						'</div>'+
						'<div class="modal-footer">'+
							'<button type="button" class="btn btn-danger" ng-click="close()">Annuler</button>'+
							'<button type="button" class="btn btn-success" ng-click="remove()">Je confirme !</button>'+
						'</div>',
			controller: function($scope, $modalInstance, User) {
				
				$scope.close = function() {
					$modalInstance.close();
				}

				$scope.remove = function(){
					$modalInstance.close(true);
				}
			}
	   	});

		modalInstance.result.then(function (res) {
      		if ( res == true) {
      			User.remove();
      		}
    	});
	}
}]);

PermutantCtrl.controller('ModalUploadCtrl', function($scope, $modalInstance, $timeout) {
	$scope.myImage='';
	$scope.myCroppedImage='';
	$scope.sendDisabled = true;

	$timeout(function() {
		angular.element(document.querySelector('#fileInput')).on('change', function(evt) {
			$scope.sendDisabled = false;
			var file=evt.currentTarget.files[0];
			var reader = new FileReader();
			reader.onload = function (evt) {
				$scope.$apply(function($scope){
					$scope.myImage=evt.target.result;
				});
			};
			reader.readAsDataURL(file);

		});
	});

	$scope.send = function() {
		var datauri = $("#croped-img").attr('src');
		$modalInstance.close(datauri);
	}

	$scope.close = function() {
		$modalInstance.close();
	}
	
});