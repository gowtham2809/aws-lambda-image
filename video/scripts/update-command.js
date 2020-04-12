const {
    readPackageConfig,
    getRuntimeVersion
} = require('./common');

const { runtime, profile, region } = readPackageConfig();

const ffmpegLayerARN = "arn:aws:lambda:us-east-2:847998363625:layer:ffmpeg:2";

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
