const apiConfigs = {
	API_URL: process.env.NEXT_PUBLIC_APP_MODRATE_API_URL, // backend
	firebaseKey: `${process.env.NEXT_PUBLIC_APP_FIREBASE_KEY}`,
	firebaseUrl: `${process.env.NEXT_PUBLIC_APP_FIREBASE_URL}`,
	longDynamicBaseLink: `${process.env.NEXT_PUBLIC_APP_LONGDYNAMICBASE_LINK}`,
	firebaseApn: `${process.env.NEXT_PUBLIC_APP_FIREBASE_APN}`,
	firebaseisi: `${process.env.NEXT_PUBLIC_APP_FIREBASE_ISI}`,
	firebaseibi: `${process.env.NEXT_PUBLIC_APP_FIREBASE_IBI}`,
	mobileUrl: `${process.env.NEXT_PUBLIC_APP_MOBILE_URL}`,
	intercomAppId: `${process.env.NEXT_PUBLIC_APP_INTERCOME_APPID}`,
	CUSTOMER_URL: `${process.env.NEXT_PUBLIC_APP_CUSTOMER_FRONTEND}`,
	branchio_key: `${process.env.NEXT_PUBLIC_APP_BRANCHIO_KEY}`,
	branchio_url: `${process.env.NEXT_PUBLIC_APP_BRANCHIO_URL}`,
	pendo_url:`${process.env.NEXT_PUBLIC_APP_PENDO_URL}`,
	pendo_token:`${process.env.NEXT_PUBLIC_APP_PENDO_TOKEN}`,
	env: `${process.env.NEXT_PUBLIC_APP_ENV}`,
	logAws: {
		logGroupName: process.env.NEXT_PUBLIC_APP_LOG_GROUP_NAME,
		logStreamName: process.env.NEXT_PUBLIC_APP_LOG_STREAM_NAME,
		logAccessKeyId: process.env.NEXT_PUBLIC_APP_LOG_ACCESS_KEY_ID,
		logSecretAccessKey: process.env.NEXT_PUBLIC_APP_LOG_SECRET_ACCESS_KEY,
		REGION: `${process.env.NEXT_PUBLIC_APP_REGION}`,
	  },
};
export default apiConfigs;