const express = require('express');
const app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let fs = require('fs');
let chokidar = require('chokidar');
let clientCount = 0;

app.get("/", (req, res) => {
    res.status(200).send("Server online.")
});

app.get("/capture/", (req, res) => {
    res.sendFile("/home/pi/flight/snap.jpg");
});

io.on('connection', function (client) {
    clientCount++;
    fs.writeFile("variables.txt", JSON.stringify({"takePhoto": false, "takeVideo": true}), (err) => {});
    console.log("client connect...", client.id)
    client.on('disconnect', function () {
	clientCount--;
        console.log('client disconnect...', client.id)
	if (clientCount == 0) {
	     fs.writeFile("variables.txt", JSON.stringify({"takePhoto": false, "takeVideo": false}), (err) => {});
	}
    });
    client.on('error', function (err) {
        console.log('received error from client:', client.id)
        console.log(err)
    });
    client.on('take_photo', () => {
    	console.log("Taking photo.");
	fs.writeFile("variables.txt", JSON.stringify({"takePhoto": true, "takeVideo": false}), (err) => {});
    });
    client.on('resume_video', () => {
    	console.log("Resuming video.");
	fs.writeFile("variables.txt", JSON.stringify({"takePhoto": false, "takeVideo": true}), (err) => {});
    });
});

chokidar.watch("./preview.jpg", {persistent: true}).on("change", () => {
    fs.readFile("/home/pi/flight/preview.jpg", (err, buffer) => {
        io.emit("live_preview_image", { buffer: buffer.toString("base64") })
    })
})


chokidar.watch("./snap.jpg", {persistent: true}).on("change", () => {
    io.emit("photo_taken");
    console.log("Photo taken. Emitting event to clients.")
})
/*
fs.watchFile("./preview.jpg", {"interval": 5}, () => {
    fs.readFile("/home/pi/flight/preview.jpg", (err, buffer) => {
        io.emit("live_preview_image", { buffer: buffer.toString("base64") })
    })
})
*/

server.listen(8000, () => {
    console.log("Listening on port 8000.");
});
