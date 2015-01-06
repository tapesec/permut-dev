(function(){
	var sha1 = require('sha1');

	api = function(data, step){
		
		var datas = {};

		if(data.dateEntree)
			datas.dateAdmin = data.dateEntree;
		if(data.ville)
			datas.residence = data.ville;
		if(data.dateGrade)
			datas.dateGrade = data.dateGrade;
		if(data.avatar)
			datas.avatar = data.avatar;
		if(data.grade)
			datas.grade = data.grade;
		if(data.service)
			datas.service = data.service;
		if(data.login)
			datas.name = data.login;
		if(data.password)
			datas.password = sha1(data.password);
		if(data.destination){
			datas.destination = {};
			if(data.destination.choix1)
				datas.destination.choix1 = data.destination.choix1;
			if(data.destination.choix2)
				datas.destination.choix2 = data.destination.choix2;
			if(data.destination.choix3)
				datas.destination.choix3 = data.destination.choix3;
		}
		if(data.presentation)
			datas.description = data.presentation;
		if(data.email)
			datas.email = data.email;


		if(data.dateEntree && 
		   data.ville &&
		   data.dateGrade && 
		   data.grade && 
		   data.destination.choix1 && 
		   data.presentation && 
		   data.email  && 
		   data.service){
			datas.ready = true;
		}

		datas.tokken = sha1(data.login+data.grade+data.password);
		datas.ministere = "Intérieur";
		datas.institution = "Police Nationale";
		datas.subCategory = "Personnels actifs"
		return datas;
	}

	 module.exports = api;
})();