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
			style: "@autoStyle"
		},
		require: 'ngModel',
		link:function(scope, elem, attrs, ctrl){
			elem.children("div").children("ul").css('display', 'none');
			scope.$watch('item', function(nVal) {
				scope.search(nVal);
				scope.$watch('listeville', function(nVal, oVal){
					scope.listeVilles = [];
					scope.listeVilles = nVal;
				});
			});

			scope.selected = function(viewValue){
				scope.item = viewValue.ville + ' ('+viewValue.cp+')';
				ctrl.$setValidity(scope.inputname, true);
			}

			$(elem).children("div").children("ul").click(function(){
				elem.children("div").children("ul").css('display', 'none');
			});
			
			$(elem).children("div").children("input").keydown(function(){
				elem.children("div").children("ul").css('display', 'block');
				ctrl.$setValidity(scope.inputname, false);
			});	
		}
	}
});

PermutantDirectives.directive('confirmPassword', function($parse){
	return{
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, elem, attrs, ctrl){
			scope.$watch(attrs.ngModel, function(){
				if(scope.$eval(attrs.ngModel) != scope.$eval(attrs.password)){
					ctrl.$setValidity('like', false);
				}else{
					ctrl.$setValidity('like', true);
				}
			});
			scope.$watch(attrs.password, function(){
				if(scope.$eval(attrs.ngModel) != scope.$eval(attrs.password)){
					ctrl.$setValidity('like', false);
				}else{
					ctrl.$setValidity('like', true);
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
		scope: {
			select: "="
		},
		link: function(scope, elem, attrs, ctrl){
			scope.$watch('select', function(nval){
				if(nval != "pasDeCritere"){
					$(elem).attr('disabled', false);
				}
			});
		}
	}
});