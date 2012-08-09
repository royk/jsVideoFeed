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

requestSearch( {clean:true, videoOfTheDay:true});