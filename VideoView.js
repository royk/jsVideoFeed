// When scroll reaches bottom, ask for more videos, if canRequestMore is true.
$(window).scroll(function(){
		if ($(window).scrollTop() + $(window).innerHeight()>=document.body.scrollHeight) {
			requestMore();
		}
});

$("#controlsOpener").hide();

var allowAddVideo = function allowAddVideo() {
	$("#controlsOpener").show();
	$("#controls").slideDown("fast");
};

// Adds open/close logic to add video button.
$("#controlsOpener").click(function(){
	if ($("#controls").is(":hidden")){
		$("#controls").slideDown("fast");
	}else{
		$("#controls").hide();
	}
});

// Logic for send video button
var doSend = function doSend(){
	var params = {
		title : document.getElementById("title").value || "" ,
		url : document.getElementById("url").value|| "",
		tags : document.getElementById("tags").value|| "",
		players : document.getElementById("players").value|| "",
		maker : document.getElementById("maker").value|| "",
		year : document.getElementById("year").value|| "",
		location : document.getElementById("location").value|| ""
	};
	// Callback for send video result
	var cb = function callback(resultObject) {
		if (resultObject.success) {
			document.getElementById("title").value = "";
			document.getElementById("url").value = "";
			document.getElementById("tags").value = "";
			document.getElementById("players").value = "";
			document.getElementById("maker").value = "";
			document.getElementById("year").value = "";
			document.getElementById("location").value = "";
			$("#controls").delay(100).hide();
		}
		document.getElementById("result").innerText = resultObject.message;
	};
	// send request to create new video
	VideoServerLayer.createEntry(params, cb);
};

// Callback for search by tags input
var doSearch = function doSearch(){
	var tags = document.getElementById("searchTerms").value;
	requestSearch({	tags: tags,
					clean:true});
};

// controller callbacks

var clean = function clean() {
	$("#container").empty();
};

var appendElements = function appendElements(elements, viewMode) {
	elements.forEach(function(element) {
		var exists = $("#"+element.id).length>0;
		if (!exists) {
			$("#container")[0].appendChild(element.html);
			if (viewMode=="view") {
				$("#"+element.id).hover(function(){
						$("."+element.id).fadeTo("fast", 1);
					}, function(){
						$("."+element.id).fadeTo("fast", 0);
					}
				);
			}
		}
	});
	// Apply element behaviors
	// Info fade in/out
	if (viewMode=="view") {
		// Enter edit mode
		$(".buttonEdit").click(function(){
			clean();
			displayResults("edit");
		});
	}else{
		$(".buttonSave").click(function(){
			var id = this.getAttribute("id");
			var data = dataObjects[id];
			if (data){
				var params = {
					src: data.src,
					title: $("input."+id+".titleInput")[0].value,
					year: $("input."+id+".yearInput")[0].value,
					location: $("input."+id+".locationInput")[0].value,
					maker: $("input."+id+".makerInput")[0].value,
					players: $("input."+id+".playersInput")[0].value
				};
				VideoServerLayer.updateEntry(params, function(res){
					canRequestMore = true;
					$("#container").empty();
					requestVideosCB(videosJson);
				});
			}
		});
	}
};

var extractGetParams = function extractGetParams() {
	var prmstr = window.location.search.substr(1),
		prmarr = prmstr.split ("&"),
		params = {},
		i,
		tmparr;

	for (i=0; i<prmarr.length; i++) {
		tmparr = prmarr[i].split("=");
		params[tmparr[0]] = tmparr[1];
	}
	return params;
};

// Request initial feed - either a specific video or a search, depending on url params.
var videoview_params = extractGetParams();
if (videoview_params.id) {
	$("#scrollForMore").hide();
	requestSearch({clean:true, id:videoview_params.id});
}else {
	requestSearch({clean:true});
}

// Used by the controller when searches are over in lieu of an event
var viewSearchCallback = function viewSearchCallback(shownResults, totalResults) {
	if (totalResults) {
		if(shownResults<totalResults) {
			$("#scrollForMore").show();
		} else {
			$("#scrollForMore").hide();
		}
	}
};