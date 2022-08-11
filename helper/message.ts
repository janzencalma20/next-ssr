export enum NotificationErrTypes {
	sessionNotValid = "sessionNotValid"
}
export type INotificationError = {
	[key in NotificationErrTypes]: string;
}

const MESSAGES = {
	EMAIL: {
		EMPTY: "Enter a email",
		INVALID: "Please enter valid email address",
	},
	PAGE_TITLE: {
		signup: "Live Experience Sign Up",
		installPage: "Install Immersion",
		perTest: "Pre-Test Immersion",
		testConnection: "Testing Connection",
		upcoming: "Upcoming Live Experience",
		PageNotFound: "Page Not Found"
	},
	NOTIFICATIONS: {
		ERROR: {
			someThingWrong: "Sorry, Something Went Wrong!",
		}
	}
}
export default MESSAGES;