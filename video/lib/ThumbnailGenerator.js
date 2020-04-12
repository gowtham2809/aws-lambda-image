"use strict";
const { spawnSync, spawn } = require('child_process');
const fs = require("fs");
const path = require("path");

const VideoData = require("./VideoData");
const ImageData = require("./ImageData");

const cropSpec = /(\d+)x(\d+)([+-]\d+)?([+-]\d+)?(%)?/;

/**
 * Get enable to use memory size in ImageMagick
 * Typically we determine to us 90% of max memory size
 * @see https://docs.aws.amazon.com/lambda/latest/dg/lambda-environment-variables.html
 */
const getEnableMemory = () => {
    const mem = parseInt(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE, 10);
    return Math.floor(mem * 90 / 100);
};

const ffprobePath = '/opt/nodejs/ffprobe';
const ffmpegPath = '/opt/nodejs/ffmpeg';
const allowedTypes = ['mov', 'mpg', 'mpeg', 'mp4', 'wmv', 'avi', 'webm'];

class ThumbnailGenerator {
    /**
     * Thumbnail Generator
     * generate thumnail with ffmpeg
     *
     * @constructor
     * @param Object options
     */
    constructor(options) {
        this.options = options;
    }
    
    /**
     * Execute thumbnail gen
     *
     * @public
     * @param VideoData video
     * @return Promise
     */
    exec(video){
        const acl = this.options.acl;
        var width = this.options.size;
        return new Promise(async (resolve, reject)=>{
            console.log("Resizing to: " + (this.options.directory || "in-place"));

            if (allowedTypes.indexOf(video.ext.replace(".","")) === -1) {
                reject(`filetype: ${video.ext} is not an allowed type`);
            }
            
            const duration = this.getDuration(video);
            try {
                var thumbnailPath = await this.createImage(duration * .1, video);
                //convert to ImageData
                var thumbBuffer = fs.readFileSync(thumbnailPath);
                var imageKey = this.options.directory + "/" + video.baseName.replace(video.ext,".jpg");
                
                resolve(new ImageData(
                    imageKey,
                    video.bucketName,
                    thumbBuffer,
                    video.headers,
                    acl || video.acl
                ))
            }catch(err){
                reject('Failed to generate Thumbnail');
            }
        });
    }

    /**
     * Get Video Duration
     *
     * @public
     * @param VideoData video
     * @return Promise
     */
    getDuration(video) {
        try{
            //copy buffer to file
            var tempFile = "/tmp/" + video.baseName;
            fs.writeFileSync(tempFile, video.data);
            const ffprobe = spawnSync(ffprobePath, [
                '-v',
                'error',
                '-show_entries',
                'format=duration',
                '-of',
                'default=nw=1:nk=1',
                tempFile
              ])
            const duration = Math.ceil(ffprobe.stdout.toString())
            return duration;
        }catch(err){
            console.log(err);
            return 0;
        }
    }
    
    /**
     * Generate Thumbnail at Position
     *
     * @public
     * @param int atDuration
     * @param VideoData video
      * @return Promise
     */
    createImage(atDuration, video){
        var width = this.options.size;
        return new Promise((resolve, reject) => {
            var filePath = this.getThumbnailFilePath(video);            
            let tmpFile = fs.createWriteStream(filePath);
            let videoFile = "/tmp/" + video.baseName;
            
            const ffmpeg = spawn(ffmpegPath, [
                '-ss',
                atDuration,
                '-i',
                videoFile,
                '-vf',
                `thumbnail`,
                '-qscale:v',
                '2',
                '-frames:v',
                '1',
                '-f',
                'image2',
                '-c:v',
                'mjpeg',
                'pipe:1'
              ]);
            try{
                ffmpeg.stdout.pipe(tmpFile);
            }catch(err){
                reject();
            }
            

            ffmpeg.on('close', function(code) {
                tmpFile.end();
                resolve(filePath);
            });

            ffmpeg.on('error', function(err) {
                console.log(err)
                reject()
            });
        });
    }

    /**
     * Get ThumbnailFile Path
     *
     * @public
     * @param VideoData video
      * @return String
     */
    getThumbnailFilePath(video){
        var fileName = path.parse(video.baseName).name;
        return '/tmp/thumb-'+fileName+'.jpg';
    }

}

module.exports = ThumbnailGenerator;
