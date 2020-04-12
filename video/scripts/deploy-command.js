const {
    readPackageConfig,
    getRuntimeVersion
} = require('./common');

const {
    region = "eu-west-1",
    memory = "1280",
    timeout = "5",
    runtime = "nodejs10.x",
    profile,
    name,
    role
} = readPackageConfig();

const ffmpegLayerARN = "arn:aws:lambda:us-east-2:847998363625:layer:ffmpeg:2";

const claudiaCommand = [
    "claudia",
    "create",
    "--version dev",
    "--handler index.handler",
    "--no-optional-dependencies",
    "--policies policies/*.json",
    `--profile ${profile}`,
    `--region ${region}`,
    `--timeout ${timeout}`,
    `--memory ${memory}`,
    `--runtime ${runtime}`
];
if (role) {
    claudiaCommand.push(`--role ${role}`);
}
if (name) {
    claudiaCommand.push(`--name ${name}`);
}
// if runtime is upper than nodejs10.x, need Layer
if (getRuntimeVersion(runtime) >= 10) {
    claudiaCommand.push(`--layers ${ffmpegLayerARN}`);
}

process.stdout.write(claudiaCommand.join(" "));
