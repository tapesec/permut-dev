(function(){
	var sha1 = require('sha1');

	api = function(data){
		
		var datas = {};

		if(data.dateAdmin)
			datas.dateEntree = data.dateAdmin;
		if(data.residence)
			datas.ville = data.residence;
		if(data.avatar)
			datas.avatar = data.avatar;
		if(data.dateGrade)
			datas.dateGrade = data.dateGrade;
		if(data.grade)
			datas.grade = data.grade;
		if(data.service)
			datas.service = data.service;
		if(data.name)
			datas.login = data.name;
		/*if(data.password)
			datas.password = sha1(data.password);*/
		if(data.destination){
			datas.destination = {};
			if(data.destination.choix1)
				datas.destination.choix1 = data.destination.choix1;
			if(data.destination.choix2)
				datas.destination.choix2 = data.destination.choix2;
			if(data.destination.choix3)
				datas.destination.choix3 = data.destination.choix3;
		}
		if(data.description)
			datas.presentation = data.description;
		if(data.email)
			datas.email = data.email;
		if(data.status)
			datas.status = data.status;
		
		datas.ready = data.ready;

		return datas;
	}

	 module.exports = api;
})();