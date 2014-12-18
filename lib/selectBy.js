(function(){

	api = function(type, regex){

		var requestConstructor = {};

		/*switch(type){
			case 'residence':
			requestConstructor = {
				residence: {$regex: regex, $options: 'i'}
			}
			break;
			case 'destination':
			requestConstructor = {
				destination.choix1: {$regex: regex, $options: 'i'}
			}
			break;
			case 'grade':
			requestConstructor = {
				grade: {$regex: regex, $options: 'i'}
			}
			break;

		}*/
		


		return requestConstructor;
	}
	module.exports = api;
})();