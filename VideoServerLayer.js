/*jslint white: true */
var ServerAPI = (function () {
	"use strict";
	return {
		callGet: function callGet(url, cb, query) {
			query = query || "";
			var req = new XMLHttpRequest();
			req.onreadystatechange = function(){
				if (req.readyState==4 && req.status==200){
					cb(req.responseText);
				}
			};
			if (query){
				url = url + "?" + query;
			}
			req.open("GET", url, true);
			req.send();
		},

		callPost: function callPost(url, cb, params, options) {
			var req = new XMLHttpRequest(),
				paramString = "";
			for (var s in params){
				if (options.includeAllParams || params[s]){
					paramString += "&"+s+"="+params[s];
				}
			}
			paramString = paramString.substring(1);	// remove first &
			req.open("POST", url, true);
			req.setRequestHeader("Content-length", paramString.length);
			req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			req.setRequestHeader("Connection", "close");
			req.onreadystatechange = function(){
				if (req.readyState==4){
					var result = JSON.parse(req.responseText);
					cb(result);
				}
			};
			req.send(paramString);

		}
	};
}());


var VideoServerLayer = (function () {
	"use strict";
	var serverAPI	= Object.create(ServerAPI),
		baseURL		= "http://footbagisrael.com/slim/",

		prepareResult = function prepareResult(element){
			if (element){
				element.year		= element.year || "unknown year";
				element.location	= element.location || "unknown location";
				element.players		= element.players || "unknown";
				element.maker		= element.maker || "unknown";
			}
		},
		prepareResults = function prepareResults(result) {
			result.forEach(function(element){
				prepareResult(element);
			});
			return result;
		},
		callServerGet = function callServerGet(req, params, cb) {
			var onResponse = function onResponse(json) {
				var result = JSON.parse(json);
				// finish, send result
				result = prepareResults(result);
				cb(result);
			};
			serverAPI.callGet(req, onResponse, params);
		},
		callServerPost = function callServerPost(url, params, cb, options) {
			serverAPI.callPost(url, cb, params, options);

		},
		_getVideoData = function _getID (url){
			var source = "unknown",
				id = _getVimeoId(url);
			if (id) {
				source = "vimeo";
			}else{
				id = _getYoutubeId(url);
				if (id) {
					source = "youtube";
				}
			}
			return {
				id:	id,
				source: source
			};
		},

		_getVimeoId = function _getVimeoId (url){
			var videoId = '';

			var VimeoUrl =  /vimeo\.com\/(\d+)$/gi;

			var match  = VimeoUrl.exec(url);
			if (match && match.length && match[1]){
				//if there is a match, the second group is the id we want
				videoId = match[1];
			}
			return videoId;
		},
		_getYoutubeId = function _getYoutubeId (url) {
			var videoId = '';

			// Test for long youtube url: http://youtube.com/watch?[...&]v=[VIDEO_ID]
			var YTLongUrl = /(?:youtube\.com\/watch[^\s]*[\?&]v=)([\w-]+)/g;
			// Test for short youtube url: http://youtu.be/[VIDEO_ID]
			var YTShortUrl = /(?:youtu\.be\/)([\w-]+)/g;

			var match  = YTLongUrl.exec(url) || YTShortUrl.exec(url);
			if (match && match.length && match[1]){
				//if there is a match, the second group is the id we want
				videoId = match[1];
			}
			return videoId;
		},
		_cleanSeparators = function _cleanSeparators(input) {
			input = input.replace(/,+/g, " ");
			input = input.replace(/\s+/g, " ");
			input = input.replace(" and ", " ", "gi");
			return input;
		};
	return {
		requestFeed: function requestFeed(startIndex, cb) {
			callServerGet(baseURL+"getAll", "start="+startIndex, cb);
		},
		searchByTags: function searchByTags(startIndex, tags, cb) {
			callServerGet(baseURL+"search", "tags="+tags+"&start="+startIndex, cb);
		},
		updateEntry: function updateEntry(params, cb) {
			callServerPost(baseURL+"modify", params, cb,{includeAllParams:false});
		},
		createEntry: function createEntry(params, cb) {
			var videoData	=  _getVideoData(params.url);
			if (videoData.source=="unknown"){
				cb("Unrecognized video url", false);
			}else{
				params.tags    = _cleanSeparators(params.tags);
				params.players = _cleanSeparators(params.players);
				params.maker   = _cleanSeparators(params.maker);
				var sendParams = {
					id:	videoData.id,
					source: videoData.source,
					title:	params.title,
					tags:	params.tags,
					players:params.players,
					maker:  params.maker,
					year:	params.year,
					location: params.location
				};
				callServerPost(baseURL+"addVideo", sendParams, cb, {includeAllParams:true});
			}
			
		}
	};

}());