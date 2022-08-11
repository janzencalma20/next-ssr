import config from "../config/config"
const { Logger } = require('aws-cloudwatch-log-browser');
export async function cloudWatchLogConfig() {
	return await new Logger({
		logGroupName: config.logAws.logGroupName,
		logStreamName: config.logAws.logStreamName,
		region: config.logAws.REGION,
		accessKeyId: config.logAws.logAccessKeyId,
		secretAccessKey: config.logAws.logSecretAccessKey,
		local: false
	})
}
export async function addLogToAws(logData: any) {
	const awsLogger = await cloudWatchLogConfig();
	awsLogger.log(logData);
}