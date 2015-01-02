(function(){
	"use strict";
	api = function parse(pattern, data) {
		if(!(pattern instanceof Object) && !(data instanceof Object))
			return false;

		for (var attr in pattern) {
			if ( (!pattern[attr].required && !pattern[attr].format) && pattern[attr] instanceof Object ) {
				console.log(pattern[attr], 'pattern ligne 9');
				console.log(data[attr], 'pattern ligne 10');
				parse(pattern[attr], data[attr]);
			} else {
				console.log(pattern[attr], 'pattern ligne 14');
				console.log(data[attr], 'pattern ligne 15');
				if (pattern[attr].required) {
					if (pattern[attr].required == true) {
						if (!data[attr]) {
							//paramètre http attendu obligatoire
							return false;
						} else {
							if (pattern[attr].format) {
								var regexp = pattern[attr].format;
								if (regexp.test(data[attr]) == false) {
									console.log(data[attr], 'ligne 24');
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