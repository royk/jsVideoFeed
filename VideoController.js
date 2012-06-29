/*jshint smarttabs:true */
var requestIndex = 0;
var canRequestMore = true;
var savedResults = [];
var currentSearchTags = "";

var requestMore = function requestMore() {
	if (canRequestMore){
		requestSearch({tags: currentSearchTags, clean: false});
	}
};

var requestSearch = function requestSearch(params) {
	if (currentSearchTags!=params.tags || params.clean) {
		requestIndex = 0;
		clean();
		savedResults = [];
	}
	canRequestMore = false;
	if (params.tags) {
		currentSearchTags = params.tags;
		VideoServerLayer.searchByTags(requestIndex, params.tags, requestVideosCB);
	}else{
		currentSearchTags = "";
		VideoServerLayer.requestFeed(requestIndex, requestVideosCB);
	}
};

var requestVideosCB = function requestVideosCB(result) {
	savedResults = savedResults.concat(result);
	displayResults("view");
	// if got some result, allow search more and update request index
	if (result[0]){
		setTimeout(function(){
			canRequestMore = true;
		}, 500);
		requestIndex += result.length -1;
	}
};

var displayResults = function displayResults(viewMode) {
	var elements = createViewElements(savedResults, viewMode);
	appendElements(elements, viewMode);
};


var videosJson;
var dataObjects = {};

var createViewElements = function createViewElements(items, mode) {
	var elements = [];
	items.forEach(function(video){
		if (video) {
			var result = TemplateConstructor.construct(mode, video.type.toLowerCase(), video);
			result.html = DomConstructor.construct(result);
			elements.push(result);
		}
	});
	return elements;

};

var Templates = (function(){
	"use strict";
	return {
		vimeo: '<iframe id="{id}" src="http://player.vimeo.com/video/{src}" width="{width}" height="{height}" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>',
		youtube:'<iframe id="{id}" class="youtube-player" type="text/html" width="{width}" height="{height}" src="http://www.youtube.com/embed/{src}" frameborder="0"></iframe>',
		view: '<div>	{title}</div><div class="{id}" style="opacity:0">	{year} at {location}</div>{template}<div class="{id}" style="width:500px;-webkit-box-orient: horizontal; -moz-box-orient: horizontal; box-orient: horizontal;display:-webkit-box; display:-moz-box display:box;"> <div class="{id}" style="opacity: 0;  -webkit-box-pack: start; -moz-box-pack: start;-webkit-box-flex:1;-moz-box-flex:1;box-flex:1;">By: {maker}</div> <div class="buttonEdit {id}" id="{id}" style="cursor:pointer;opacity: 0;  -webkit-box-pack: end; -moz-box-pack: end;">Edit</div></div> <div class="{id}" style="opacity: 0; ">	Players: {players}</div></div>',
		edit: '<div style="width:500px"> <div> <input class="{id} titleInput" style="width:500px" placeholder="Title: {title}">	</input> <input class="{id} yearInput" placeholder="Year: {year}"></input>	 at <input class="{id} locationInput" placeholder="Location: {location}"></input> </div> {template} <div style="width:500px;-webkit-box-orient: horizontal; -moz-box-orient: horizontal; box-orient: horizontal;display:-webkit-box; display:-moz-box display:box;"> <div class="" style=" -webkit-box-pack: start; -moz-box-pack: start;-webkit-box-flex:1;-moz-box-flex:1;box-flex:1;"><input class="{id} makerInput" placeholder="By: {maker}"></div> <div class="buttonSave" id="{id}" style="cursor:pointer; -webkit-box-pack: end; -moz-box-pack: end;">Save</div> </div> <div class="" style="">	<input class="{id} playersInput" placeholder="Players: {players}"></div></div>'};
}());

var TemplateConstructor = (function(){
	"use strict";

	var templates	= Object.create(Templates),
		construct	= function construct(baseName, templateName, varsObj) {
				var s,
				regexp,
				template = templates[templateName],
				base	 = templates[baseName],
				id		 = varsObj["id"];
			for (s in varsObj){
				regexp = new RegExp("{"+s+"}","gi");
				template = template.replace(regexp, varsObj[s]);
				base	 = base.replace(regexp, varsObj[s]);
			}
			regexp = new RegExp("{template}", "gi");
			base = base.replace(regexp, template);
			dataObjects[id] = varsObj;
			return {html:base, id:varsObj["id"]};
		};
		return {
		construct: construct
	};
}());



var DomConstructor = (function(){
	"use strict";
	return {
		construct: function construct(params) {
			var html	= document.createElement("div");
			html.style.paddingBottom = "50px";
			html.id = params.id;
			html.innerHTML = params.html;
			return html;
		}
	};

}());



