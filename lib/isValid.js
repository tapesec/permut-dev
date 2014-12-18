(function(){
	"use strict";
	api = function(pattern, data) {
		if(!(pattern instanceof Object) && !(data instanceof Object))
			return false;
		
		for (var attr in pattern) {
			if (pattern[attr].required) {
				if (pattern[attr].required == true) {
					if (!data[attr]) {
						//paramètre http attendu obligatoire
						return false;
					} else {
						if (pattern[attr].format) {
							var regexp = pattern[attr].format;
							if (regexp.test(data[attr]) == false) {
								//Le format de la valeur ne correspond pas au format attendu
								return false;
							}
						}
					}
				}
			} else {
				//pas de paramètre required dans le pattern
				return false;
			}
		}

		//On s'assure qu'il n'existe pas de paramètre non prévu
		for (var attr in data) {
			if(!pattern[attr])
				return false;
		}
		return true;
	}

	module.exports = api;
})();