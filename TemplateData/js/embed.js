var loadEmbeddedApp = function() {
	location.replace("./index.html");
	console.log(location);
};

var getLinks = function() {
	
	var currentPath = location.href;
	currentPath = currentPath.split('/');
	currentPath.pop();
	currentPath = currentPath.join('/');
	
	var indexLocation = "\"" + currentPath + "/embed.html\"";
	var nonFullScreenEmbed =  `<br />&lt;div style=\"margin: auto; width:1024; height:768\"&gt; 
							<br />&emsp;&lt;iframe src=${indexLocation} style=\"width:100%; height:100%; border:none;\"&gt;
							<br />&emsp; &emsp; Your browser doesn't support iframes 
							<br />&emsp; &lt;/iframe&gt;
							<br />&lt;/div&gt;
							<br />`
					

	var fullScreenEmbed =  `<br />&lt;div style=\"position:fixed; top:0px; left:0px; bottom:0px; right:0px; margin: auto; width:100%; height:100%;\"&gt; 
							<br />&emsp;&lt;iframe src=${indexLocation} style=\"width:100%; height:100%; border:none;\"&gt;
							<br />&emsp; &emsp; Your browser doesn't support iframes 
							<br />&emsp; &lt;/iframe&gt;
							<br />&lt;/div&gt;
							<br />`
					
	return `Non-Full Screen Embed:<br />${nonFullScreenEmbed} <br />Full Screen Embed:<br />${fullScreenEmbed}`;
};