const {
    readPackageConfig,
    getRuntimeVersion
} = require('./common');

const { runtime, profile, region } = readPackageConfig();

const ffmpegLayerARN = "arn:aws:lambda:us-east-1:918471441435:layer:ffmpeg-layer:1";

const claudiaCommand = [
    "claudia",
    "update",
    `--profile ${profile}`
];

// if runtime is upper than nodejs10.x, need Layer
if (getRuntimeVersion(runtime) >= 10) {
    claudiaCommand.push(`--layers ${ffmpegLayerARN}`);
}

process.stdout.write(claudiaCommand.join(" "));
