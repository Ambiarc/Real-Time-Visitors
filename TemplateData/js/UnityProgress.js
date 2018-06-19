function UnityProgress(gameInstance, progress) {
	if (!gameInstance.Module)
		return;

	if (!gameInstance.logo) {
		gameInstance.logo = document.createElement("div");
		gameInstance.logo.className = "logo " + gameInstance.Module.splashScreenStyle;
		gameInstance.container.appendChild(gameInstance.logo);
	}

	gameInstance.loadingContainer = document.getElementById("gk-loading-container");

	gameInstance.ambiarcLogo = document.getElementById("ambiarc-logo-container");

	gameInstance.progress = document.getElementById("gk-progress");
	gameInstance.progress.empty = document.getElementById("empty");
	gameInstance.progress.full = document.getElementById("full");
  
	gameInstance.progressMessage = document.getElementById("progressMessageDiv");
	gameInstance.progressMessage.message = document.getElementById("progressMessage");

	gameInstance.progressSpinnerHolder = document.getElementById("progressSpinnerHolder");
  
	gameInstance.progress.full.style.width = (100 * progress) + "%";

	if(progress == "complete") {
		gameInstance.progressMessage.message.innerHTML = "3D Map Loading ...";
	}
	else if (progress >= 1) {
		gameInstance.progressMessage.message.innerHTML = "3D Map Loading ...";
	}
	else {
		gameInstance.progressMessage.message.innerHTML = "3D Map Downloading ... " + (Math.ceil(progress * 100)) + "%";
	}
}
	