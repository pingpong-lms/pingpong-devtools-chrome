function build(type, inner) { var e = document.createElement(type); e.textContent = inner; return e; }

window.onload = function() {
	$('#header').text(location.hash.substring(1));

	$('#filter').on('keyup change', function() {
		var val = $(this).val();
		var allRows = $('tbody tr');
		allRows.show();
		if (val) {
			var matchingRows = $('tbody tr:not(:contains(' + val + '))');
			$('#filter_result').text('"' + val + '" matches ' + (allRows.length-matchingRows.length) + '/' + allRows.length);
			matchingRows.hide();
		} else {
			$('#filter_result').text('');
		}
	});

	var xmlUrl = location.search.substring(1);
	var client = new XMLHttpRequest();
	client.onreadystatechange = function() {
		if(this.readyState == 4) {
			var tbody = document.getElementById('tbody');
			var doc = this.responseXML;
			var queries = doc.getElementsByTagName('query');
			for (var i = 0; i < queries.length; i++) {
				var query = queries[i];
				var tr = document.createElement('tr');
				tr.appendChild(build('td', i+1));
				tr.appendChild(build('td', query.getAttribute('time')));

				var td = $('<td/>');
				var code = $('<pre class="prettyprint lang-sql"/>');
				var s = query.textContent;
				if (s.search(/(insert |update |delete )/i) != -1) td.addClass('writequery');
				var lines = s.split('\n');
				if (lines.length > 1) {
					td.addClass('hover');
					var firstLine = $('<div class="firstline hidingsomething"/>');
				       	firstLine.text(lines[0]);
					var remaining = $('<div class="remaining" style="display:none"/>');
					remaining.text(lines.slice(1).join('\n'));
					code.append(firstLine);
					code.append(remaining);
					td.click(function() {
						$('.firstline', this).toggleClass('hidingsomething');
						$('.remaining', this).toggle('fast');
					});

				} else {
					code.text(s);
				}
				td.append(code);
				$(tr).append(td);

				td = $('<td/>');
				code = $('<pre class="rawprint"/>');
				s = query.getAttribute('stackTrace');
				lines = s.split(' ');
				if (lines.length > 1) {
					var ppCaller = null;
					for (var j = 0; j < lines.length; j++) {
						if ((/net.pingpong/).test(lines[j]) && !(/uncheckedList/).test(lines[j]) && !(/BaseDAO.+invoke/).test(lines[j])) {
							ppCaller = lines[j];
							break;
						}
					}
					td.addClass('hover');
					var firstLine = $('<div class="firstline hidingsomething"/>');
				       	firstLine.text(ppCaller ? ppCaller : lines[0]);
					var remaining = $('<div class="remaining" style="display:none"/>');
					remaining.text(lines.join('\n'));
					code.append(firstLine);
					code.append(remaining);
					td.click(function() {
						$('.firstline', this).toggleClass('hidingsomething');
						$('.firstline', this).toggle('fast');
						$('.remaining', this).toggle('fast');
					});
				} else {
					code.text(s);
				}
				td.append(code);
				$(tr).append(td);
				//tr.appendChild(build('td', query.getAttribute('stackTrace')));

				tbody.appendChild(tr);
			}
			$('#table').tablesorter();
		}
		prettyPrint();
	}
	client.open("GET", xmlUrl);
	client.send();
}
