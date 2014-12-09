window.onload = function() {
	var latestRequests = chrome.extension.getBackgroundPage().latestRequests;
	var instructions = document.getElementById('instructions');
	var data = document.getElementById('data');
	if (latestRequests.length == 0) {
		data.style.display = 'none';
		instructions.style.display = 'block';
		return;
	}
	data.style.display = 'block';
	instructions.style.display = 'none';

	var l = document.getElementById('list');
	for (var i = latestRequests.length -1; i >= 0; i--) {
		var item = document.createElement('li');
		var href = 'show-queries.html?' + latestRequests[i][1] + '#' + latestRequests[i][0];
		item.innerHTML = latestRequests[i][2] + ' <a href="' + href + '">' + latestRequests[i][0] + '</a>';
		l.appendChild(item);
	}

	document.getElementById('clear').onclick = function() {
		var latestRequests = chrome.extension.getBackgroundPage().latestRequests;
		while (latestRequests.length > 0) latestRequests.pop();
		var l = document.getElementById('list');
		while (l.hasChildNodes()) l.removeChild(l.firstChild);
		window.close();
	};

	document.getElementById('reload').onclick = function() {
		window.location.reload();
	};
}
