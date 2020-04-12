"use strict";

const ThumbnailGenerator = require('./ThumbnailGenerator');

class VideoProcessor{
    /**
     * Video processor
     * management resize/reduce video list by configration,
     * and pipe AWS Lambda's event/context
     *
     * @constructor
     * @param Object fileSystem
     * @param Object s3Object
     */
    constructor(fileSystem, s3Object) {
        this.fileSystem = fileSystem;
        this.s3Object = s3Object;
    }

    /**
     * Run the process
     *
     * @public
     * @param Config config
     */
    run(config) {
        if ( ! config.get("bucket") ) {
            config.set("bucket", this.s3Object.bucket.name);
        }

        return this.fileSystem.getObject(
            this.s3Object.bucket.name,
            decodeURIComponent(this.s3Object.object.key.replace(/\+/g, ' '))
        )
        .then((videoData) => this.processVideo(videoData, config));
    }

    /**
     * Processing video
     *
     * @public
     * @param VideoData videoData
     * @param Config config
     * @return Promise
     */
    processVideo(videoData, config) {
        const acl = config.get("acl");
        const cacheControl = config.get("cacheControl");
        const bucket = config.get("bucket");
        
        let promise = Promise.resolve();

        if(config.exists("thumbnail")){
            const thumbnailConfig = config.get("thumbnail");
            thumbnailConfig.acl              = thumbnailConfig.acl || acl;
            thumbnailConfig.cacheControl     = ( thumbnailConfig.cacheControl !== undefined ) ? thumbnailConfig.cacheControl : cacheControl;
            thumbnailConfig.bucket           = thumbnailConfig.bucket || bucket;

            promise = promise
            .then(()=>this.execCreateThumbnail(thumbnailConfig, videoData))
            .then((image) => this.fileSystem.putObject(image, thumbnailConfig))
        }
        return promise;
    }

    /**
     * Execute video thumbnail
     *
     * @public
     * @param Object option
     * @param VideoData videoData
     * @return Promise
     */
    execCreateThumbnail(option, videoData) {
        const thumbnailGenerator = new ThumbnailGenerator(option);
        return thumbnailGenerator.exec(videoData);
    }
}
module.exports = VideoProcessor;