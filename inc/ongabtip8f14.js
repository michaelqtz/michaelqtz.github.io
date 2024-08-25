if (typeof $AkzToolTip == 'undefined') {
	var $AkzToolTip = new function () {
		var head = document.getElementsByTagName('head')[0];
		var body = document.getElementsByTagName('body')[0];
		var tt, currentId;
		var items = [];
		var itemDiv;

		function createAkzElement(type, p) {
			var newelement = document.createElement(type);
			if (p) createAkzObject(newelement, p);
			return newelement;
		}

		function addAkzElement(p, element) {
			return p.appendChild(element);
		}

		function addAkzEvent(z, y, x) {
			if (window.attachEvent) z.attachEvent('on'+y, x);
			else z.addEventListener(y, x, false);
		}

		function createAkzObject(ele, s) {
			for (var p in s) {
				if (typeof s[p] == 'object') {
					if (!ele[p]) ele[p] = {};
					createAkzObject(ele[p], s[p]);
				}
				else ele[p] = s[p];
			}
		}

		function $E(e) {
			if (!e) e = event;
			if (!e.button) {
				e._button = e.which ? e.which : e.button;
				e._target = e.target ? e.target : e.srcElement;
			}
			return e;
		}

		function onMouseOver(e) {
			e = $E(e);
			var t = e._target;

			if (t.nodeName != 'A') {
				if (t.parentNode && t.parentNode.nodeName == 'A') t = t.parentNode;
				else if (t.parentNode.parentNode && t.parentNode.parentNode.nodeName == 'A') t = t.parentNode.parentNode;
				else return;
			}

			if (!t.href.length) return;

			var m = [];
			if (t.className) m['class'] = t.className;
			var site;
			var v;
			var valid = 0;
			var thref = t.href;

			if (v = thref.match(/^http:\/\/(www\.)?ongab\.ru\/user\/(\d+)$/i)) {
				m['host'] = '';
				m['qs'] = 'user='+v[2];
				m['id'] = v[2];
				valid = 1;
			}
			else if (v = thref.match(/^http:\/\/(www\.)?ongab\.ru\/about\/artifact\/#(\d+)$/i)) {
				m['host'] = '';
				m['qs'] = 'art='+v[2];
				m['id'] = v[2];
				valid = 1;
			}
			// старый вариант ссылок на skill + item
			else if (v = thref.match(/^http:\/\/(www\.)?(.+)\.ongab\.ru\/(.+)\/(\d+)(#(\d+))?/i)) {				
				m['host'] = v[2];
				m['qs'] = 'pid='+v[2]+'&'+v[3]+'='+v[4];
				m['id'] = v[3]+v[4];
				if (v[5]) {
					m['qs'] += '&n='+v[6];
					m['id'] += '-'+v[6];
				}
				valid = 1;
			}
			// skill new
			else if (v = thref.match(/^http:\/\/(www\.)?ongab\.ru\/(.+)\/skills\/(.+)\/(\d+)(#(\d+))?/i)) {
				
				console.log('v[1]: ' + v[1]);
				console.log('v[2]: ' + v[2]);
				console.log('v[3]: ' + v[3]);
				console.log('v[4]: ' + v[4]);
				console.log('v[5]: ' + v[5]);
				
				m['host'] = v[2];
				m['qs'] = 'pid='+v[2]+'&skills='+v[4];
				m['id'] = 'skill'+v[4];
				if (v[5]) {
					m['qs'] += '&n='+v[5];
					m['id'] += '-'+v[5];
				}
				valid = 1;
			}
			// skill new newerwinter
			else if (v = thref.match(/^\/skill\/(\d+)(#(\d+))?/i)) {
				//console.log('v[1]: ' + v[1]);
				//console.log('v[2]: ' + v[2]);
				m['qs'] = '&skill='+v[2];
				m['id'] = 'skill'+v[2];
				valid = 1;
			}
			
			//item new
			else if (v = thref.match(/^http:\/\/(www\.)?ongab\.ru\/(.+)\/items\/(\d+)(#(\d+))?/i)) {
				m['host'] = v[2];
				m['qs'] = 'pid='+v[2]+'&items='+v[3];
				m['id'] = v[3]+v[3];
				if (v[5]) {
					m['qs'] += '&n='+v[5];
					m['id'] += '-'+v[5];
				}
				valid = 1;
			}
			
			
			if (v && valid == 1) {
				t.title = '';
				if (!t.onmouseover) {
					t.onmousemove = onMouseMove;
					t.onmouseout = onMouseOut;
				}
				displayToolTip(m);
			}
		}

		function onMouseMove(e) {
			e = $E(e);
			showAtCursor(e);
		}

		function onMouseOut(e) {
			tt = null;
			itemDiv.style.display = 'none';
		}

		function displayToolTip(m) {
			tt = 1;

			if (m['id']) currentId = m['id'];
			var key = currentId;

			if (typeof items[key] == 'object') showToolTip(items[key].tooltip);
			else {
				if (!items[key]) {
					showLoading();
					addAkzElement(head,createAkzElement('script',{type:'text/javascript',src:'http://ongab.ru/tooltip.php?'+m['qs']}));
				}
				else showLoading();
			}
		}

		function showToolTip(itemstr) {
			itemDiv.style.display = 'block';
			itemDiv.innerHTML = itemstr;
		}

		function showLoading() {
			itemDiv.innerHTML = '';
			itemDiv.style.display = 'block';
		}

		function showAtCursor(e) {
			var obj = itemDiv;
			var maxX;
			var maxY;
			obj.style.position = 'absolute';
			obj.style.display = 'block';

			if (document.all && !window.opera) {
				if (document.documentElement && typeof document.documentElement.scrollTop != undefined) {
					maxX = document.documentElement.clientWidth + document.documentElement.scrollLeft;
					maxY = document.documentElement.clientHeight + document.documentElement.scrollTop;
					y = event.clientY + document.documentElement.scrollTop;
					x = event.clientX + document.documentElement.scrollLeft;
				}
				else {
					y = event.clientY + document.body.scrollTop;
					x = event.clientX + document.body.scrollLeft;
				}
			}
			else {
				if (document.body.scrollTop) {
					maxX = window.innerWidth + document.body.scrollLeft;
					maxY = window.innerHeight + document.body.scrollTop;
				}
				else {
					maxX = window.innerWidth + document.documentElement.scrollLeft;
					maxY = window.innerHeight + document.documentElement.scrollTop;
				}
				var y = e.pageY;
				var x = e.pageX;
			}

			var divW = parseInt(obj.offsetWidth);
			var divH = parseInt(obj.offsetHeight);
			divW = divW ? divW : 400;
			divH = divH ? divH : 100;

			if (maxX && maxY) {
				while (x + divW > (maxX - 10) && x > 0) x = x - (divW + 10);
				while (y + divH > (maxY - 25) && y > 0) y = y - 1;
			}

			if (document.body.style.marginTop) y = y - parseInt(document.body.style.marginTop.replace('px',''));

			obj.style.left = x + 15 +'px';
			obj.style.top = y + 15 +'px';
		}

		this.registerItem = function(obj) {
			var site = obj.site;
			var id;

			if (obj.key) id = obj.key;
			else if (obj.id) id = obj.id;
			else {
				id = obj.name;
				id = id.replace(/\+/g,'%2B');
			}

			var key = id;
			items[key] = obj;
			if (tt == 1) showToolTip(items[key].tooltip);
		}

		function onPageShow(e) {
			if (e.persisted) {
				tt = null;
				itemDiv.style.display = 'none';
			}
		}

		function init() {
			if (document.getElementById('tmpItemFrm')) itemDiv = document.getElementById('tmpItemFrm');
			else {
				itemDiv = document.createElement('div');
				itemDiv.id = 'tmpItemFrm';
				body.appendChild(itemDiv);
			}
			//addAkzElement(head, createAkzElement('link',{type:'text/css',href:'http://ongab.ru/html/css/tooltip.css',rel:'stylesheet'}));
			addAkzEvent(document,'mouseover',onMouseOver);
			addAkzEvent(window,'pageshow',onPageShow);
		}

		init();
  }
}