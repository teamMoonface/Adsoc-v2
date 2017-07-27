$(document).ready(function(){
	var username_Check = {
		init : function(){
			$('').on('keyup', this.check_Username);
		}

		check_Username.function(key){
			if(key.length() < 8){
				//return string length
			}
			else if(Student.findOne({'username': username}) != null){
				//return alr taken
			}
			else{
				//return username can be used
			}

		}
	}
})