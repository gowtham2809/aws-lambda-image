"use strict";

const path         = require("path");
const imageType    = require("image-type");
const PathTemplate = require("path-template");

class ImageType {

    /**
     * Gets real image type from ImageData
     *
     * @constructor
     * @param ImageData image
     */
    constructor(image) {
        const type = imageType(image.data);
        if ( type ) {
            this._ext = type.ext;
            this._mime = type.mime;
        } else {
            this._ext = path.extname(image.fileName).slice(1).toLowerCase();
            this._mime = image.headers.ContentType;
        }
    }

    /**
     * Extension getter
     *
     * @public
     * @return String: "png", "jpg", etc...
     */
    get ext() {
        return this._ext;
    }

    /**
     * Mime getter
     *
     * @public
     * @return String: "image/png", "image/jpeg", etc...
     */
    get mime() {
        return this._mime;
    }
}

class ImageData {
    /**
     * Image data interface
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

        this._type = new ImageType(this);
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
     * Image type getter
     *
     * @public
     * @return String
     */
    get type() {
        return this._type;
    }

    /**
     * Image buffer getter
     *
     * @public
     * @return Buffer
     */
    get data() {
        return this._data;
    }

    /**
     * Image headers getter
     *
     * @public
     * @return Object
     */
    get headers() {
        return this._headers;
    }

    /**
     * Image acl getter
     *
     * @public
     * @return Object
     */
    get acl() {
        return this._acl;
    }

    /**
     * Image extension getter
     *
     * @public
     * @return String
     */
    get ext() {
      return this._ext;
    }

}

module.exports = ImageData;
