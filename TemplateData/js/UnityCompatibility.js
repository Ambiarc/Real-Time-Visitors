UnityLoader.compatibilityCheck = function(e,t,r) {
	console.log("Skipped comaptibility check!");
	if(UnityLoader.SystemInfo.hasWebGL) {
		if(UnityLoader.SystemInfo.mobile) {
			$("#CompatModal").modal();
			$(document).on("click", "#CompatModalContinue", function(event){
              t();
            });
		} else if (["Firefox", "Chrome", "Safari"].indexOf(UnityLoader.SystemInfo.browser) == -1) {
			$("#CompatModal").modal();s
			$(document).on("click", "#CompatModalContinue", function(event){
              t();
            });
		}
		else {
		 t();
		}
	} else {
		$("#CompatModal").modal();
			$(document).on("click", "#CompatModalContinue", function(event){
              	r();
            });
	}
};

$(document).on("click", "#CompatModalGoBack", function(event){
    window.history.back(); 
});


