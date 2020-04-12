"use strict";

const eventParser    = require("./lib/EventParser");
const S3FileSystem   = require("./lib/S3FileSystem");
const Config         = require("./lib/Config");
const VideoProcessor = require("./lib/VideoProcessor");
const fs = require("fs");
const path = require("path");

// Lambda Handler
exports.handler = (event, context, callback) => {
    var eventRecord = eventParser(event);
    if (eventRecord) {
        process(eventRecord, callback);
    } else {
        console.log(JSON.stringify(event));
        callback("Unsupported or invalid event");
        return;
    }
};

function process(s3Object, callback) {
    const configPath = path.resolve(__dirname, "config.json");
    const fileSystem = new S3FileSystem();
    const config     = new Config(
        JSON.parse(fs.readFileSync(configPath, { encoding: "utf8" }))
    );
    const processor  = new VideoProcessor(fileSystem, s3Object);

    processor.run(config).
    then((processedVideos) => {
        const message = "OK, videos were processed.";
        console.log(message);
        callback(null, message);
        return;
    }).catch((messages) => {
        if ( messages === "Object was already processed." ) {
            console.log("Video already processed");
            callback(null, "Video already processed");
            return;
        } else if ( messages === "Empty file or directory." ) {
            console.log( "Video file is broken or it's a folder" );
            callback( null, "Video file is broken or it's a folder" );
            return;
        } else {
            callback("Error processing " + s3Object.object.key + ": " + messages);
            return;
        }
    });
}
