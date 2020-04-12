"use strict";

const path         = require("path");
const PathTemplate = require("path-template");

class VideoType {

    /**
     * Gets real video type from VideoData
     *
     * @constructor
     * @param VideoData video
     */
    constructor(video) {
        this._ext = path.extname(video.fileName).slice(1).toLowerCase();
        this._mime = video.headers.ContentType;
    }

    /**
     * Extension getter
     *
     * @public
     * @return String: "mp4", "mkv", etc...
     */
    get ext() {
        return this._ext;
    }

    /**
     * Mime getter
     *
     * @public
     * @return String: "video/mp4", "video/mkv", etc...
     */
    get mime() {
        return this._mime;
    }
}

class VideoData {
    /**
     * Video data interface
     *
     * @constructor
     * @param String key
     * @param String name
     * @param String|Buffer data
     * @param Object headers
     * @param Object acl
     */
    constructor(key, name, data, headers, acl) {
        this._fileName   = key;
        this._bucketName = name;
        this._data       = ( Buffer.isBuffer(data) ) ? data : new Buffer(data, "binary");
        this._headers    = Object.assign({}, headers);
        this._acl        = acl;
        this._ext        = path.extname(key);

        this._type = new VideoType(this);
        this._headers.ContentType = this._type.mime;
    }

    /**
     * Bucket name getter
     *
     * @public
     * @return String
     */
    get bucketName() {
        return this._bucketName;
    }

    /**
     * Basename getter
     *
     * @public
     * @return String
     */
    get baseName() {
        return path.basename(this._fileName);
    }

    /**
     * Dirname getter
     *
     * @public
     * @return String
     */
    get dirName() {
        const dir = path.dirname(this._fileName);

        return ( dir === "." ) ? "" : dir;
    }

    /**
     * Filename getter
     *
     * @public
     * @return String
     */
    get fileName() {
        return this._fileName;
    }

    /**
     * Video type getter
     *
     * @public
     * @return String
     */
    get type() {
        return this._type;
    }

    /**
     * Video buffer getter
     *
     * @public
     * @return Buffer
     */
    get data() {
        return this._data;
    }

    /**
     * Video headers getter
     *
     * @public
     * @return Object
     */
    get headers() {
        return this._headers;
    }

    /**
     * Video acl getter
     *
     * @public
     * @return Object
     */
    get acl() {
        return this._acl;
    }

    /**
     * Video extension getter
     *
     * @public
     * @return String
     */
    get ext() {
      return this._ext;
    }

    /**
     * Combines dirName, filename, and directory (from options).
     *
     * @public
     * @param String directory (from options)
     * @param String filePrefix (from options)
     * @param String fileSuffix (from options)
     * @param Boolean keepExtension (from options)
     * @return String
     */
    combineWithDirectory(output) {
        const prefix = output.prefix || "";
        const suffix = output.suffix || "";
        const fileName = path.parse(this.baseName).name;
        const extension = ( output.keepExtension )
          ? this.ext
          : "." + this.type.ext;

        const template = output.template;
        if ( typeof template === "object" && template.pattern ) {
            const inputTemplate = PathTemplate.parse(template.pattern);
            const outputTemplate = PathTemplate.parse(template.output || "");

            const match = PathTemplate.match(inputTemplate, this.dirName);
            if ( match ) {
                const outputPath = PathTemplate.format(outputTemplate, match);
                return path.join(outputPath, prefix + fileName + suffix + extension);
            } else {
                console.log( "Directory " + this.dirName + " didn't match template " + template.pattern );
            }
        }

        const directory = output.directory;
        if ( typeof directory === "string" ) {
            // ./X , ../X , . , ..
            if ( directory.match(/^\.\.?\//) || directory.match(/^\.\.?$/) ) {
                return path.join(this.dirName, directory, prefix + fileName + suffix + extension);
            } else {
                return path.join(directory, prefix + fileName + suffix + extension);
            }
        }

        return path.join(this.dirName, prefix + fileName + suffix + extension);
    }
}

module.exports = VideoData;
