var requestIndex = 0;
var canRequestMore = false;
var allowSearchByScroll = function() {
	setTimeout(function(){
				canRequestMore = true;
			}, 500);
};
// When scroll reaches bottom, ask for more videos, if canRequestMore is true.
$(window).scroll(function(){
		if (canRequestMore==false){
			return;
		}
		if ($(window).scrollTop() + $(window).innerHeight()>=document.body.scrollHeight) {
			
			canRequestMore = false;
			allowSearchByScroll();	// turn on allow with delay
			requestIndex += 5;
			VideoFeed.requestFeed(requestIndex, requestVideosCB);
		}
});

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
		title : document.getElementById("title").value,
		url : document.getElementById("url").value,
		tags : document.getElementById("tags").value,
		players : document.getElementById("players").value,
		maker : document.getElementById("maker").value,
		year : document.getElementById("year").value,
		location : document.getElementById("location").value
	};
	// Callback for send video result
	var cb = function callback(message, success) {
		if (success) {
			document.getElementById("title").value = "";
			document.getElementById("url").value = "";
			document.getElementById("tags").value = "";
			document.getElementById("players").value = "";
			document.getElementById("maker").value = "";
			document.getElementById("year").value = "";
			document.getElementById("location").value = "";
			$("#controls").hide();
		}
		document.getElementById("result").innerText = message;
	};
	// send request to create new video
	VideoFeedCMS.create(params, cb);
};
var requestVideosCB = function requestVideosCB(elements) {
	elements.forEach(function(element){
		var container = document.getElementById("container");
		container.appendChild(element);
	});
	// If scroll is enabled and result is empty, that means that more scrolling will create empty results.
	if (canRequestMore && elements.length==0) {
		canRequestMore = false;
	}
};
// Request initial feed
VideoFeed.requestFeed(requestIndex, requestVideosCB);
allowSearchByScroll();
// Callback for search by tags input
var doSearch = function doSearch(){
	var tags = document.getElementById("searchTerms").value;
	$("#container").empty();
	requestIndex = 0;
	if (tags){
		VideoFeed.searchByTags(tags, requestVideosCB);
		canRequestMore = false;
	}else{
		VideoFeed.requestFeed(requestIndex, requestVideosCB);
		allowSearchByScroll();
	}
};
