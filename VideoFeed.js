/*jslint white: true */
var ServerAPI = (function () {
	"use strict";
	return {
		call: function call(url, cb) {
			var req = new XMLHttpRequest();
			req.onreadystatechange = function(){
				if (req.readyState==4 && req.status==200){
	            	cb(req.responseText);
	            }
	        }
	        req.open("GET", url, true);
	        req.send();
		}
	};
}());

var Templates = (function(){
	"use strict";
	return {
		vimeo: 	'<iframe src="http://player.vimeo.com/video/{src}" width="{width}" height="{height}" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>',
		youtube:'<iframe class="youtube-player" type="text/html" width="{width}" height="{height}" src="http://www.youtube.com/embed/{src}" frameborder="0"></iframe>'
	};
}());

var TemplateConstructor = (function(){
	"use strict";
	return {
		construct: function construct(templateString, varsObj)  {
			var s,
	            regexp;
	        for (s in varsObj){
	        	regexp = new RegExp("{"+s+"}","gi");
	        	templateString = templateString.replace(regexp, varsObj[s]);
	        }
	        return templateString;
		}
	};
}());

var DomConstructor = (function(){
	"use strict";
	return {
		construct: function construct(params) {
			var elem 		= document.createElement(params.elemType),
				container 	= document.getElementById(params.containerId);

			elem.innerHTML = params.content;
			container.appendChild(elem);
			return elem;
		}
	};

}());

var VideoFeed = (function () {
	"use strict";
	var serverAPI 	= Object.create(ServerAPI),
	    templates	= Object.create(Templates),
	    template 	= Object.create(TemplateConstructor),	
	    dom 		= Object.create(DomConstructor),

	    createElement = function(element){
	    	if (element){
				dom.construct({	containerId :"container", 
							elemType 	:"div", 
							content 	: template.construct(templates[element.type], element)
				});		
			}
		};
	return {
		requestFeed: function requestFeed(url) {
			var onResponse = function onResponse(json) {
				var result = JSON.parse(json);
				result.forEach(createElement);
			};	
			serverAPI.call(url, onResponse);
		},
		saveFeed: function saveFeed() {
			console.log("savefeed");
		}
	};

}());
 

