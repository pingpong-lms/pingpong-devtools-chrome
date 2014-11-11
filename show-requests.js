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
		item.innerHTML = latestRequests[i][2] + ' <a href="' + latestRequests[i][1] + '">' + latestRequests[i][0] + '</a>';
		l.appendChild(item);
	}

	document.getElementsByTagName('body')[0].addEventListener('click', function(e) {
			var href = e.target.getAttribute('href');
			if (href) {
				chrome.tabs.getSelected(null, function(tab) {
					chrome.tabs.create({index:tab.index, url:'show-queries.html?' + href + '#' + e.target.textContent});
					//if (window.location.href.indexOf('pingpongtab') == -1) window.close();
				});
				e.preventDefault();
			}
	}, true);

	document.getElementById('clear').onclick = function() {
		var latestRequests = chrome.extension.getBackgroundPage().latestRequests;
		while (latestRequests.length > 0) latestRequests.pop();
		var l = document.getElementById('list');
		while (l.hasChildNodes()) l.removeChild(l.firstChild);
		window.close();
	};

	document.getElementById('show').onclick = function() {
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.create({index:tab.index, url:'show-requests.html?pingpongtab=true'});
			window.close();
		});
	};
}
