function UnityProgress(gameInstance, progress) {
	if (!gameInstance.Module)
		return;
	if (!gameInstance.logo) {
		gameInstance.logo = document.createElement("div");
		gameInstance.logo.className = "logo " + gameInstance.Module.splashScreenStyle;
		gameInstance.container.appendChild(gameInstance.logo);
	}
	if (!gameInstance.progress) {    
		gameInstance.progress = document.createElement("div");
		gameInstance.progress.className = "gk-progress " + gameInstance.Module.splashScreenStyle;
		gameInstance.progress.empty = document.createElement("div");
		gameInstance.progress.empty.className = "empty";
		gameInstance.progress.appendChild(gameInstance.progress.empty);
		gameInstance.progress.full = document.createElement("div");
		gameInstance.progress.full.className = "full";
		gameInstance.progress.appendChild(gameInstance.progress.full);
		document.body.appendChild(gameInstance.progress);
	}
  
	if(!gameInstance.progressMessage) {
		gameInstance.progressMessage = document.createElement("div");
		gameInstance.progressMessage.className = "progressMessage";
		gameInstance.progressMessage.message = document.createElement("p");
		gameInstance.progressMessage.appendChild(gameInstance.progressMessage.message);
		document.body.appendChild(gameInstance.progressMessage);
	}
	
	if(!gameInstance.progressSpinnerHolder) {
		gameInstance.progressSpinnerHolder = document.createElement("div");
		gameInstance.progressSpinnerHolder.className = "progressSpinnerHolder";
		gameInstance.progressSpinnerHolder.progressSpinner = document.createElement("div");
		gameInstance.progressSpinnerHolder.progressSpinner.className = "progressSpinner";
		gameInstance.progressSpinnerHolder.appendChild(gameInstance.progressSpinnerHolder.progressSpinner);
		document.body.appendChild(gameInstance.progressSpinnerHolder);
	}
  
	gameInstance.progress.full.style.width = (100 * progress) + "%";
	gameInstance.progress.empty.style.width = (100 * (1 - progress)) + "%";

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
	