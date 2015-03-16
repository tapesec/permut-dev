'use strict';

/* Directives */



var PermutantDirectives = angular.module('myApp.directives', []);


PermutantDirectives.directive('appVersion', ['version', 
	function(version) {
    	return function(scope, elm, attrs) {
      		elm.text(version);
    	};
  	}]);

/*Typeahead*/
PermutantDirectives.directive('autofill', function(){
	return {
		restrict: 'E',
		templateUrl: '../partials/directives-templates/typeahead.html',
		scope: {
			label: "@",
			prompt: "@",
			item: "=ngModel",
			search: "&action",
			listeville: "=",
			inputname: "@name",
			style: "@autoStyle",
			pattern: "@",
			load: "="
		},
		require: 'ngModel',
		link:function(scope, elem, attrs, ctrl){
			elem.children("div").children("ul").css('display', 'none');

			scope.$watch('item', function(nVal) {
				
				if(nVal)
					scope.search(nVal);
				
				if( nVal == "" || nVal == undefined) {
					ctrl.$setValidity(scope.inputname, true);
					elem.children("div").children("ul").css('display', 'none');
				} else {
					var regex = new RegExp(scope.pattern);
					if( !regex.test(nVal) ){
						ctrl.$setValidity(scope.inputname, false);
						elem.children("div").children("ul").css('display', 'block');
					} else {
						ctrl.$setValidity(scope.inputname, true);
						elem.children("div").children("ul").css('display', 'none');
					}
				}

				scope.$watch('listeville', function(nVal, oVal){
					scope.listeVilles = [];
					scope.listeVilles = nVal;
				});
			});

			scope.$watch('load', function(nVal) {
				scope.showLoader = nVal;
			});

			scope.selected = function(viewValue){
				scope.item = viewValue.ville + ' ('+viewValue.cp+')';
				ctrl.$setValidity(scope.inputname, true);
				elem.children("div").children("ul").css('display', 'none');
			}
		}
	}
});

PermutantDirectives.directive('confirmPassword', function($parse, $timeout){
	return{
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, elem, attrs, ctrl){
			scope.$watch(attrs.ngModel, function(){
				if(scope.$eval(attrs.ngModel) != scope.$eval(attrs.password)){
					ctrl.$setValidity('unlike', false);
				}else{
					ctrl.$setValidity('unlike', true);
				}
			});
			scope.$watch(attrs.password, function(){
				if(scope.$eval(attrs.ngModel) != scope.$eval(attrs.password)){
					ctrl.$setValidity('unlike', false);
				}else{
					ctrl.$setValidity('unlike', true);
				}
			});
			/*$timeout(function() {
				ctrl.$setValidity('unlike', false);
			});*/
		}
	}
});

PermutantDirectives.directive('captcha', function() {

	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, elem, attrs, ctrl) {

			ctrl.$setValidity('captchaOk', false);
			scope.captcha.result = scope.$eval(attrs.opun) * scope.$eval(attrs.opdeux) + 4;

			scope.$watch(attrs.ngModel, function() {
				if (scope.$eval(attrs.ngModel) == scope.captcha.result) {
					ctrl.$setValidity('captchaOk', true);
				} else {
					ctrl.$setValidity('captchaOk', false);
				}
			});
		}
	}

});
/*Directive qui détermine la validité d'un champ en fonction du boolean passé à l'attribut correct*/
PermutantDirectives.directive('checkPassword', function(){
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, elem, attrs, ctrl){
			scope.$watch(attrs.correct, function(){
				if(scope.$eval(attrs.correct) == false){
					ctrl.$setValidity('wrongPassword', false);
				}else{
					ctrl.$setValidity('wrongPassword', true);
				}
			});	
		}
	}
});


/*Directives qui desactive un input si le select qui lui est raccroché n'a pas été utilisé*/
PermutantDirectives.directive('multipleType', function(){

	return {
		restrict: 'A',
		
		link: function(scope, elem, attrs, ctrl){
			
			scope.$watch(attrs.select, function(nval){

				switch(nval) {
					case 'residence':
					scope.input.myplaceholder = "Résidence";
					break;
					case 'destination':
					scope.input.myplaceholder = "Destination";
					break;
					case 'grade':
					scope.input.myplaceholder = "Grade";
					break;
					default:
					scope.input.myplaceholder = "Tapez votre recherche ici";
				}

				if(nval != "pasDeCritere"){
					$(elem).attr('disabled', false);
				}
			});
		}
	}
});