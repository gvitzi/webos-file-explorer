var Service = require('webos-service');
var service = new Service("com.gilvitzi.explorer.service");
var fs = require('fs');
var path = require("path");

service.register("hello", function(message) {
	message.respond({
		data: "Hello, " + message.payload.name + "!"
	});
});

service.register("getFiles", function(message) {
	var dir = message.payload.path;
	dir = path.normalize(dir);
	fs.readdir(dir, function(err, files) {
		if (err) {
			message.respond(err);
			return;
		}
		var data = [];
			
		files.forEach(function(file) {
			var entry = { name : file };
			entry.hidden = (file.indexOf(".") == 0);

			var isFile = false;
			entry.type = "folder";

			try {
				var stats = fs.statSync(path.join(dir, file));
				isFile = stats.isFile();
				if (isFile) {
					entry.size = stats["size"];
					entry.type = "file";
				}
			} catch (ex) {}
			
			data.push(entry);
		});
	
		console.log(data);		  

		message.respond({
			path: dir,
			data: data
		});
	});
	
});