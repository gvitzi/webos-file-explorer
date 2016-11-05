function humanFileSize(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['KB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}

function showFailure(error){
	$("#fileListError").text("Failed: " + error.errorText);
}

function getFiles(path) {
	
	var request = webOS.service.request("luna://com.gilvitzi.explorer.service/", {
		method:"getFiles",
		parameters: {path : path},	
		onFailure: showFailure,
		onComplete: showFiles
	});
}

function showFiles(inResponse)	{
	if(inResponse.returnValue) {
		var entries = inResponse.data;
		var path = inResponse.path;
		$("#location").text(path);
		
		var tbody = $("#fileList");
		tbody.empty();

		if (path != "/") {
			tbody.append(createUpOneLevelRow());
		}

		// for each entry check if folder or file and add to list
		entries.forEach(function(entry) {
			var newRow = createNewRow(entry);
			tbody.append(newRow);
		});
	}
	else {
		showFailure(inResponse);
	}
	return true;
}

function createNewRow(entry) {
	var tr = $("<tr>");

	var icondTd = $("<td class='icon'>");
	var iconSpan = $("<span>");
	icondTd.append(iconSpan);
	iconSpan.addClass("glyphicon");

	var nameTd = $("<td>");
	var sizeTd = $("<td>");

	if (entry.type == "folder") {
		iconSpan.addClass("glyphicon-folder-close");

		nameTd.text(entry.name);
		tr.on('click', function(){
			var location = $("#location");
			var path = location.html() + "/" + entry.name;
			getFiles(path);
		});

	} else { 
		iconSpan.addClass("glyphicon-file");
		nameTd.text(entry.name);
		sizeTd.text(humanFileSize(entry.size, true));
	}

	tr.append(icondTd);
	tr.append(nameTd);
	tr.append(sizeTd);
	if (entry.hidden) {
		tr.addClass('hidden');
	}
	tr.addClass(entry.type);
	return tr;
}

function createUpOneLevelRow() {
	// add up one folder
	var tr = $("<tr>");
	var nameTd = $("<td>");
	var path = $("#location").html();

	tr.on('click', function(){
		getFiles(path + "/../");
	});

	tr.append($("<td class='icon'><span class='glyphicon glyphicon-menu-left'></span></td>"));
	tr.append(nameTd);
	tr.append($("<td>"));
	
	return tr;
}
