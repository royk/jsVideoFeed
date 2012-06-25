var VideoFeedCMS = (function() {
	"use strict";
	var _getVideoData = function _getID (url){
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
				id: 	id,
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
		_getYoutubeId = function _getYoutubeId (url){
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
		};
	return {
		create: function create(params, cb) {
			var req = new XMLHttpRequest(),
				paramString = "",
				videoData 	=  _getVideoData(params.url);
			// concat tags with all other text fields
			if (videoData.source=="unknown"){
				cb("Unrecognized video url", false);
			}else{
				params.tags += " " + params.players + " " + params.maker + " " + params.year + " " + params.location;
				// convert comas to spaces in tags
				params.tags = params.tags.replace(/,+/g, " ");
				// remove double spaces
				params.tags = params.tags.replace(/\s+/g, " ");
				var sendParams = {
					id: 	videoData.id,
					source: videoData.source,
					title: 	params.title,
					tags: 	params.tags,
					players:params.players,
					maker:  params.maker,
					year: 	params.year,
					location: params.location
				};
				for (var s in sendParams){
					paramString = paramString += "&"+s+"="+sendParams[s];
				}
				paramString = paramString.substring(1);	// remove first &

				req.open("POST", "http://footbagisrael.com/slim/addVideo", true);
				req.setRequestHeader("Content-length", paramString.length);
				req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				req.setRequestHeader("Connection", "close");
				req.onreadystatechange = function(){
					var returnString = "",
						success = false;
					if (req.readyState==4 && req.status==200){
						returnString = "Video Saved";
						success = true;
					}else{
						if (req.status==304){
							returnString = "Video already exists.";
						}else{
							returnString = "Failed saving video.";
						}
					}
					cb(returnString, success);
				};
				req.send(paramString);
			}
		}
	};
	
}());