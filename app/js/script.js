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
		entries.forEach(function(entry, index) {
			var newRow = createNewRow(entry, index);
			tbody.append(newRow);
		});

		tbody.first().addClass('selected');
	}
	else {
		showFailure(inResponse);
	}
	return true;
}

function createNewRow(entry, index) {
	var tr = $("<tr tabindex='" + (101 + index) + "'>");

	var icondTd = $("<td class='icon'>");
	var iconSpan = $("<span>");
	icondTd.append(iconSpan);
	iconSpan.addClass("glyphicon");

	var nameTd = $("<td class='name'>");
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
	
	tr.hover(function() {
		$('tr.selected').removeClass('selected');
		tr.addClass('selected');
	});
	return tr;
}

function createUpOneLevelRow() {
	// add up one folder
	var tr = $("<tr class='folder' tabindex='" + 100 + "'>");
	var nameTd = $("<td class='name'>");
	var path = $("#location").html();

	tr.on('click', function(){
		getFiles(path + "/../");
	});

	tr.append($("<td class='icon'><span class='glyphicon glyphicon-menu-left'></span></td>"));
	tr.append(nameTd);
	tr.append($("<td>"));
	
	return tr;
}

function handleKeyPress(inEvent) {
	inEvent.preventDefault();
	//console.log("key pressed! keyCode = " + inEvent.keyCode);
	var keycode;
 
	if(window.event) { 
		keycode = inEvent.keyCode;
	} else if(e.which) { 
		keycode = inEvent.which;
	} 
	switch(keycode) {
		case 13: onRemoteKeyOk(); break; 
		case 38: onRemoteKeyUp(); break;
		case 40: onRemoteKeyDown(); break;
	}
}

function onRemoteKeyOk() {
	clickOnSelectedElement();
}

function onRemoteKeyUp() {
	focusPrevElement();
}

function onRemoteKeyDown() {
	focusNextElement();
}

function clickOnSelectedElement(){
	var $selectedName = $('tr.selected td.name');

	if ($selectedName.length > 0 && selectedRowIsFolder()) {
		var name = $selectedName.html() == "" ? '/../' : $selectedName.html();
		var $location = $("#location");
		var path = $location.html() + "/" + name;
		getFiles(path);
	}
}

function selectedRowIsFolder($element) {
	return $('tr.selected').hasClass('folder');
}

function focusPrevElement(element) {
	// Get all focusable elements on the page
	var $canfocus = $('[tabIndex]');
	var $selected = $('tr.selected');
	var index = $canfocus.index($selected) - 1;
	if (index < 0) index = $canfocus.length -1;
	$selected.removeClass('selected');
	var $newSelected = $canfocus.eq(index);
	$newSelected.addClass('selected');
	scrollTo($('tbody#fileList'), $newSelected);
}

function focusNextElement() {
	// Get all focusable elements on the page
	var $canfocus = $('[tabIndex]');
	var $selected = $('tr.selected');
	var index = $canfocus.index($selected) + 1;
	if (index >= $canfocus.length) index = 0;
	$selected.removeClass('selected');
	var $newSelected = $canfocus.eq(index);
	$newSelected.addClass('selected');
	$('#fileList').scrollTo($newSelected);
}

function scrollTo($target, $element, animationTime) {
	$target.animate({
        scrollTop: $element.offset().top
    }, 1000);
}