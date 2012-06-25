/*jslint white: true */
var ServerAPI = (function () {
	"use strict";
	return {
		call: function call(url, cb, query) {
			query = query || "";
			var req = new XMLHttpRequest();
			req.onreadystatechange = function(){
				if (req.readyState==4 && req.status==200){
	            	cb(req.responseText);
	            }
	        }
	        if (query){
	        	url = url + "?" + query;
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
	var elements = [];
	return {
		construct: function construct(params) {
			var elem 		= document.createElement(params.elemType);
			elem.style.paddingBottom = "50px";
			elem.innerHTML = params.content;
			elements.push(elem);
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

	    createElement = function createElement(element){
	    	var res;
	    	if (element){
				res = dom.construct({	elemType 	:"div", 
										content 	: template.construct(templates[element.type.toLowerCase()], element)
				});		
			}
			return res;
		},
		createElements = function createElements(result) {
			var elements = [];
			result.forEach(function(element){
				var res = createElement(element);
				if (res){
					elements.push(res);
				}
			});
			return elements;
		};
	return {
		requestFeed: function requestFeed(startIndex, cb) {
			var onResponse = function onResponse(json) {
				var result = JSON.parse(json);
				// finish, send videos
				cb(createElements(result));
			};	
			serverAPI.call("http://footbagisrael.com/slim/getAll", onResponse, "start="+startIndex);
		},
		searchByTags: function searchByTags(tags, cb) {
			var onResponse = function onResponse(json) {
				var result = JSON.parse(json);
				// finish, send videos
				cb(createElements(result));
			};	
			serverAPI.call("http://footbagisrael.com/slim/search", onResponse, "tags="+tags);
		}

		
	};

}());
 
