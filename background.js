var servers = [
	'localhost',
	'xn--tranbr-fua.pingpong.se',
	'alfa.pingpong.net',
	'aprikos.pingpong.net',
	'bilda.kth.se',
	'boras.pingpong.net',
	'gul.gu.se',
	'hjarntorget.net',
	'kommun.pingpong.net',
	'phs.pingpong.net',
	'pingpong-vas-1.it.gu.se',
	'pingpong.admin.kth.se',
	'pingpong.chalmers.se',
	'pingpong.hb.se',
	'pingpong.hj.se',
	'pingpong.it.gu.se',
	'pingpong.ki.se',
	'pingpong.lul.se',
	'pingpong.uu.se',
	'ppbackup.hb.se',
	'server.pingpong.net',
	'trunk.pingpong.net',
	'ugli.pingpong.net',
	'umu.pingpong.net',
	'vi.pingpong.net',
	'www.pingpong.falun.se'
];

// Fired when a page action icon is clicked. This event will not fire if the page action has a popup.
chrome.pageAction.onClicked.addListener(function(tab) {
	var details = { 'code': 'window.location = "/toggleShowKey.do"' };
	chrome.tabs.executeScript(tab.id, details);
});

chrome.commands.onCommand.addListener(function(command) {
	chrome.tabs.getSelected(null, function(tab) {
		if (command == 'switch-language') {
			var details = { 'code': 'window.location = "/toggleShowKey.do"' };
			chrome.tabs.executeScript(tab.id, details);
		} else if (command == 'show-requests') {
			chrome.tabs.create({index:tab.index, url:'show-requests.html?pingpongtab=true'});
		}
	});
});

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	for (var i = 0; i < servers.length; i++) {
		if (tab.url.indexOf(servers[i]) > -1) {
			chrome.pageAction.show(tabId);
			return;
		}
	}
});

chrome.contextMenus.create({
	'title' : 'Login as %s',
	'contexts' : ['link'],
	'targetUrlPatterns': ['*://*/*personalDetailPopup.do*'],
	'onclick' : function(info, tab) {
		var userid = info.linkUrl.split('=')[1].replace(' ', '');
		var pathSlashIndex = info.linkUrl.indexOf('/', 9);
		var schemeAndDomain = info.linkUrl.substring(0, pathSlashIndex);
		var whereToGo = schemeAndDomain + '/servlets/changeUser?userid=' + userid;
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.update(tab.id, {url: whereToGo});
		});
	}
});

chrome.notifications.onClicked.addListener(function(notificationId) {
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.create({index:tab.index, url:'show-requests.html?pingpongtab=true'});
	});
});

// Accessed from popup.html and show.html:
window.latestRequests = [];

var requestListener = function(details) {
	for (var i = details.responseHeaders.length-1; i >= 0; i--) {
		var header = details.responseHeaders[i];
		if (header.name == 'X-Request-UUID') {
			var url = details.url;
			if (url.length < 12) continue;
			var firstSlash = url.indexOf('/', 10);
			var path = '/';
			if (firstSlash != -1) {
				path = url.substring(firstSlash);
				url = url.substring(0, firstSlash + 1);
			}
			if (/(.png|.css|.gif|.js([?]|$))/.test(path)) continue;
			url += 'fetch.do?ppRequestUUID=' + header.value;
			var d = new Date();
			var pad = function(num) { return (num < 10 ? '0' : '') + num; }
			var timeString = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
			latestRequests.push([path, url, timeString]);
			if (latestRequests.length > 500) latestRequests.shift();
			//if (window.notificationId) chrome.notifications.clear('daNotificationId');
			chrome.notifications.create('1', {
				type: "basic",
				title: "Request analyzed",
				message: "" + path,
				iconUrl: "icon-bloatometer.png"
			}, function(notificationId) {});
			break;
		}
	}
};

var filters = {urls: ["*://*/*"]};
chrome.webRequest.onBeforeRedirect.addListener(requestListener, filters, ["responseHeaders"]);
chrome.webRequest.onCompleted.addListener(requestListener, filters, ["responseHeaders"]);

