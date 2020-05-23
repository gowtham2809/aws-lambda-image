npm config set aws-lambda-image:profile tartlabs
npm run add-s3-handler --s3_bucket="onco-power-dev-s3" --s3_prefix="storage/" --s3_suffix=".jpg"
npm run add-s3-handler --s3_bucket="onco-power-dev-s3" --s3_prefix="storage/" --s3_suffix=".jpeg"
npm run add-s3-handler --s3_bucket="onco-power-dev-s3" --s3_prefix="storage/" --s3_suffix=".png"
npm run add-s3-handler --s3_bucket="onco-power-dev-s3" --s3_prefix="storage/" --s3_suffix=".gif"
clear