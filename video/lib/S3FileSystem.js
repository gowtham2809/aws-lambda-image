"use strict";

const VideoData = require("./VideoData");
const aws       = require("aws-sdk");

class S3FileSystem {

    constructor() {
        this.client = new aws.S3({ apiVersion: "2006-03-01" });
    }

    /**
     * Get object data from S3 bucket
     *
     * @param String bucket
     * @param String key
     * @return Promise
     */
    getObject(bucket, key, acl) {
        return new Promise((resolve, reject) => {
            console.log("Downloading: " + key);

            this.client.getObject({ Bucket: bucket, Key: key }).promise().then((data) => {
                if ( "vid-processed" in data.Metadata ) {
                    reject("Object was already processed.");
                } else if ( data.ContentLength <= 0 ) {
                    reject("Empty file or directory.");
                } else {
                    resolve(new VideoData(
                        key,
                        bucket,
                        data.Body,
                        { ContentType: data.ContentType, CacheControl: data.CacheControl, Metadata: data.Metadata },
                        acl
                    ));
                }
            }).catch((err) => {
                reject("S3 getObject failed: " + err);
            });
        });
    }

    /**
     * Put object data to S3 bucket
     *
     * @param VideoData video
     * @return Promise
     */
    putObject(video, options) {
        const params = {
            Bucket:       video.bucketName,
            Key:          video.fileName,
            Body:         video.data,
            Metadata:     Object.assign({}, video.headers.Metadata, { "vid-processed": "true" }),
            ContentType:  video.headers.ContentType,
            CacheControl: (options.cacheControl !== undefined) ? options.cacheControl : video.headers.CacheControl,
            ACL:          video.acl || "private"
        };

        console.log("Uploading to: " + params.Key + " (" + params.Body.length + " bytes)");

        return this.client.putObject(params).promise();
    }

    /**
     * Delete object data from S3 bucket
     *
     * @param VideoData video
     * @return Promise
     */
    deleteObject(video) {
        const params = {
            Bucket: video.bucketName,
            Key:    video.fileName
        };

        console.log("Delete original object: " + params.Key);

        return this.client.deleteObject(params).promise();
    }


}

module.exports = S3FileSystem;
