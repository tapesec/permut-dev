'use strict';

/* Directives */



var PermutantDirectives = angular.module('myApp.directives', []);


PermutantDirectives.directive('appVersion', ['version', 
	function(version) {
    	return function(scope, elm, attrs) {
      		elm.text(version);
    	};
  	}]);

PermutantDirectives.directive('uploadForm', function($modal, $http) {
	return {
		restrict: 'A',
		link: function(scope, elem, attrs, ctrl) {
			$(elem[0]).change(function(){
				console.log(elem[0].files[0]);
				$modal.open({

				    templateUrl: 'partials/popups/uploader.html',

				    controller: function($scope, $modalInstance) {

				    	$scope.file = elem[0].files[0];

						$scope.createThumbnail = function(file) {
						    var reader = new FileReader();
						    reader.addEventListener('load', function() {
						    	var btn = document.getElementById('btn-rotate');
						    	var positionImage = {
						    		angle: 0,
						    		revolution: 0 };

								btn.addEventListener('click', function(e) {
									console.log(e.offsetX+ ' px (x) et ' + e.offsetY+ ' px (y)');
									if(positionImage.revolution <= 4){
										positionImage.angle += 90;
										positionImage.revolution++;
									}else{
										positionImage.angle = 0;
										positionImage.revolution = 0;
									}
									$('#avatar-to-resize').css('rotate', positionImage.angle);
									$('#avatar-to-resize').animate({rotate: ''+positionImage.angle}, 0);
								});

						        var prev = document.getElementById('img-prev');
							    var imgElement = document.createElement('img');
							    imgElement.id = "avatar-to-resize";
							    imgElement.style.maxWidth = '400px';
							    imgElement.style.maxHeight = '400px';
							    imgElement.src = this.result;
							    prev.appendChild(imgElement);
							    $("#uploaderModal").css('min-height', '450px');
						        
						    }, false); 
						    reader.readAsDataURL(file);
						}

						$scope.createThumbnail($scope.file);

						$scope.send = function() {
							var form = new FormData();
							form.append('file', $scope.file);

							$http.post('/avatar', form, {
								headers: {'Content-Type': undefined},
								transformRequest: angular.identity
							})
							.success(function(response) {
							    alert('Upload terminé !'+ response);
							});
						}

						$scope.close = function() {
							$modalInstance.close();
						}
					}
	    		});
			});
		} 
	}

});


PermutantDirectives.directive('cropMyFace', function () {
	return {
		restrict: 'A',
		link: function (scope, iElement, iAttrs) {
			var img;
			$(iElement).on('click', function(event) {

				console.log($(event.target).offset().left + "x " + $(event.target).offset().top + " y");
				img = $(this).children().get(0);
				console.log($(img).offset().left + " px " + $(img).offset().top + " px");
			});
		}
	};
})

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