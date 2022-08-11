import * as actionTypes from "../actionTypes";
import gql from "graphql-tag"
import Messages from "../../../helper/message"
import { Store } from 'react-notifications-component';
import ReactHtmlParser from "react-html-parser";
import {
	isMobile
} from "react-device-detect";
import axios from "axios";
import Config from "../../../config/config";
import { addLogToAws } from "../../../config/awslog"
declare const pendo: any;

// SignUp Success
const SignupSuccess = (item: any) => ({
	type: actionTypes.SIGNUP_SUCCEED,
	payload: item,
});

// Session Valid Success
const SessionValidate = (item: any) => ({
	type: actionTypes.SESSION_VALID,
	payload: item,
});

// Session not  Valid
const SessionNotValidate = (item: any) => ({
	type: actionTypes.SESSION_VALID,
	payload: item,
});

// Default Tenant Success
const defaultTenantSuccess = (projects: any) => ({
	type: actionTypes.DEFAULT_TENANT,
	payload: projects
});

const SessionParticipantValidate = (item: any) => ({
	type: actionTypes.PARTICIPANT_VALID,
	payload: item,
});

//Send Email Success 
const SendEmailSuccess = (item: any) => ({
	type: actionTypes.SEND_EMAIL,
	payload: item,
});

//Success Measurement 
const SuccessMeasurement = (item: any) => ({
	type: actionTypes.MEASUREMENTS,
	payload: item,
});

//Success Measurement 
const getUserSuccess = (item: any) => ({
	type: actionTypes.GET_USER,
	payload: item,
});

const getSessionUserParticipant = (item: any) => ({
	type: actionTypes.GET_SESSION_USER_PARTICIPANT,
	payload: item
});

const getSessionParticipantMailCheck = (item: any) => ({
	type: actionTypes.GET_SESSION_PARTICIPANT_EMAIL,
	payload: item
});

const emailResponse = (item: any) => ({
	type: actionTypes.EMAIL_RESPONSE,
	payload: item,
});

// fail notification
const notificationFail = (err: any, errormessage: any) => {
	let msg = Messages.NOTIFICATIONS.ERROR.someThingWrong;
	if (errormessage) {
		msg = errormessage
	}
	if (err.graphQLErrors && err.graphQLErrors.length > 0) {
		msg = err.graphQLErrors[0].message;
	} else if (err.message) {
		msg = err.message;
	}
	Store.addNotification({
		title: "Error!",
		message: <p>{ReactHtmlParser(msg)}</p>,
		type: "danger",
		insert: "bottom",
		container: "bottom-center",
		animationIn: ["animate__animated", "animate__fadeIn"],
		animationOut: ["animate__animated", "animate__fadeOut"],
		dismiss: {
			duration: 3000,
			onScreen: true
		}
	});

	return {
		type: actionTypes.ADD_NEW_NOTIFICATION_FAIL,
		state: msg
	}
};

// SignUp API
export const SignUpUser = (client: any, request: any) => {
	return async (dispatch: any) => {
		const mutation = gql`
			mutation moderatedSignup($lastname: String,
				$firstname: String,
				$session_code: String!,
				$email: String!,
				$pid:String) {
				moderatedSignup(
					lastname: $lastname, 
					firstname: $firstname,
					session_code: $session_code,
					email:$email,
					pid:$pid) {
						session_code
						session_status
						install_page
						email
						identifier
						message
						status
						error
						firstname
						device_type
					}
				}
		`;
		client.mutate({
			mutation: mutation,
			fetchPolicy: "no-cache",
			variables: {
				session_code: request.session_code,
				lastname: request.lastname,
				firstname: request.firstname,
				email: request.email,
				pid: request.pid
			}
		}).then((response: any) => {
			if (response.data.moderatedSignup.error === false) {
				dispatch(SignupSuccess(response.data.moderatedSignup));
			}
		}).catch(() => {

		});
	}
};

// get defaultTenant
export const getDefaultTenant = (client: any, req: any) => {
	return (dispatch: any) => {
		const query = gql`
			query defaultTenant($email: String!) {
				defaultTenant(email: $email) {
					customer_id
					customer_name
					display_name
					deleted
					active
					default_tenant
					public_tenant
					created_at
					updated_at
				}
			}
		`;
		client.query({
			query: query,
			fetchPolicy: "no-cache",
			variables: { email: req.email }
		}).then((response: any) => {
			if (response.data.defaultTenant) {
				dispatch(defaultTenantSuccess(response.data.defaultTenant));
			}
		}).catch(() => {

		})
	}
};

// get Check Session Valid
export const CheckSessionValid = (client: any, req: any, callback?: any) => {
	return async (dispatch: any) => {
		const query = gql`
			query sessionValid($session_code: String!) {
				sessionValid(session_code: $session_code) {
					session_id
					session_status
					started_at
					session_title
					session_description
					started_at
					ended_at
					scheduled_start_at
					scheduled_end_at
					session_code
					owner_company
					owner_first_name
					owner_last_name
					owner_profile_pic
					owner_company_logo
					owner_user_id
					customer_id
					session_length
					category_background_url
					session_subcategory
					sharing_info
					department_alias
				}
			}
    `;
		try {
			const res = await client.query({
				query: query,
				fetchPolicy: "no-cache",
				variables: {session_code: req.session_code}
			});
			dispatch(SessionValidate(res.data.sessionValid));
			if (callback) {
				return res.data.sessionValid;
			}
		} catch (e) {
			dispatch(SessionValidate(null));
			if (callback) {
				return null;
			}
		}
	}
};

//get Send Email Me
export const SendEmailMe = (client: any, request: any) => {
	return async (dispatch: any) => {
		const mutation = gql`
    mutation EmailMe($session_code: String,$email: String!,$firstname: String,$type: Float!,$deepLink:String!,$deeplink_and:String!) {
      EmailMe(session_code: $session_code,email:$email,firstname:$firstname,type:$type,deepLink:$deepLink,deeplink_and:$deeplink_and) {
				message
				success
				error
				}
			}
		`;
		client.mutate({
			mutation: mutation,
			fetchPolicy: "no-cache",
			variables: request
		}).then((response: any) => {
			if (response.data.EmailMe.success) {
				dispatch(SendEmailSuccess(response.data.EmailMe));
			}
		}).catch(() => {

		});
	}
};

export const SendEmailMobile = (bool: boolean) => ({
	type: actionTypes.UPDATE_SEND_EMAIL,
	payload: bool,
});

export const SendPushNotification = (client: any, request: any) => {
	return (dispatch: any) => {
		const query = gql`
      query sendAppNotify($token: String!,$token_type:String!,$message:String,$identifier:String,$silent:Boolean,$isapplewatch:Boolean,$userschema:String) {
        sendAppNotify(token: $token,token_type: $token_type,message:$message,identifier:$identifier,silent:$silent,isapplewatch:$isapplewatch,userschema:$userschema) {
          message 
          error
          success   
          }
        }
		`;
		const variables = { ...request };
		client.query({
			query: query,
			fetchPolicy: "no-cache",
			variables
		})
			.then(async (res: any) => {
				if (res.errors) {
					dispatch(notificationFail({}, res.errors[0].message))
				}
			}).catch(() => {

			})
	}
};

//get Measurement
export const getMeasurement = (client: any, request: any) => {
	return async (dispatch: any) => {
		const query = gql`
    query CheckMeasurement($to: Float!,$from: Float!,$identifier: String!) {
      CheckMeasurement(to: $to,from:$from,identifier:$identifier) {
          identifier
          measurements{
            heart_rate
            interpolated
            zscore
            time_stamp
            }
           }
          }        
      `;
		client.query({
			query: query,
			fetchPolicy: "no-cache",
			variables: request
		}).then((response: any) => {
			if (response.data.CheckMeasurement) {
				if (response.data.CheckMeasurement.measurements)
					dispatch(SuccessMeasurement(response.data.CheckMeasurement.measurements));
			}
		}).catch(() => {

		});
	}
}

//get USER BY IDENTIFIER
export const userByIdentifier = (client: any, request: any) => {
	return async (dispatch: any) => {
		const query = gql`
    query userByIdentifier($identifier: String!) {
      userByIdentifier(identifier:$identifier) {
            first_name
            last_name
            username
			plan
			userType
			team     
            created_at           
            userdevice{
              phone
              phone_type
              identifier
              phone_token
              sensor
              sensor_type
              sensor_token
            }
            roles {
              role_name
            }
           }
          }
      `;
		client.query({
			query: query,
			fetchPolicy: "no-cache",
			variables: request
		}).then(async (response: any) => {
			if (response.data.userByIdentifier) {
				dispatch(getUserSuccess(response.data.userByIdentifier));
				let userRole = 'NEW'
				if (response.data.userByIdentifier.roles && response.data.userByIdentifier.roles.role_name) {
					userRole = 'EXISTING'
				}
				await pendo.initialize({
					visitor: {
						id: response.data.userByIdentifier.username,
						email: response.data.userByIdentifier.username,
						role: userRole
					},
					account: {
						id: 'MOD-APP',
						experience: request.session_code,
						mobile: isMobile ? true : false
					}
				});
				let req: any = [{ "visitorId": response.data.userByIdentifier.username, "values": { "Plan": response.data.userByIdentifier.plan, "Team": response.data.userByIdentifier.team, "UserType": response.data.userByIdentifier.userType } }]
				let pendoHeader = {
					'x-pendo-integration-key': Config.pendo_token
				};
				await axios.post(`${Config.pendo_url}visitor/custom/value`,
					req, {
					headers: pendoHeader
				}
				).then(async (res: any) => {
					addLogToAws({ category: 'success', method: 'pendo API', message: 'page:auth.tsx async pendo API response', data: { res: res, req: req } });
				}).catch((e: any) => {
					addLogToAws({ category: 'error', method: 'pendo API', message: 'page:auth.tsx async pendo API response', data: { error: e, req: req } });
				})
			}
		}).catch((error: any) => {
			dispatch(getUserSuccess(null));
		});
	}
}

const GetWebTokenSuccess = (item: any) => ({
	type: actionTypes.GET_WEBTOKEN,
	payload: item,
});

export const GetWebToken = (client: any, req: any) => {
	return (dispatch: any) => {
		const query = gql` 
    query GetWebToken($session_code: String!,$webtoken:String!) {
      GetWebToken(session_code: $session_code,webtoken:$webtoken) {
        association_id
        session_code
        webtoken
        identifier
        useremail
          }
        }
      `;
		client.query({
			query: query,
			fetchPolicy: "no-cache",
			variables: { ...req }
		}).then((response: any) => {
			if (response.data) {
				dispatch(GetWebTokenSuccess(response.data.GetWebToken))
			}
		}).catch(() => {

		})
	}
};

export const WebSession = (client: any, req: any) => {
	return (dispatch: any) => {
		const query = gql` 
    mutation WebSession($session_code: String!,$webtoken:String!,$email:String) {
      WebSession(session_code: $session_code,webtoken:$webtoken,email:$email) {
        association_id
        session_code
        webtoken
        identifier
        useremail
        
          }
        }
      `;
		client.query({
			query: query,
			fetchPolicy: "no-cache",
			variables: { ...req }
		}).then((response: any) => {

			dispatch(GetWebToken(client, req));

		}).catch(() => {

		})
	}
};

export const participantUpdateLastStep = (client: any, req: any) => {
	return (dispatch: any) => {
		const query = gql` 
    query participantUpdateLastStep($session_code: String!,$email:String!,
    $identifier: String,$last_step:String!) {
      participantUpdateLastStep(session_code:$session_code,email:$email,
    identifier: $identifier,last_step:$last_step) {
      message
      success
      error
          }
        }
      `;
		const variables = { ...req };

		client.query({
			query: query,
			fetchPolicy: "no-cache",
			variables: variables
		}).then(() => {

		}).catch(() => {

		})
	}
};

export const sessionUserParticipant = (client: any, req: any) => {
	return (dispatch: any) => {
		const query = gql` 
    query sessionParticipantCheck($session_code: String!,
    $identifier: String!,$email:String) {
      sessionParticipantCheck(session_code:$session_code
      identifier: $identifier,email:$email) {
        message
        status
        userDetails{
          user_id
          username
          first_name
          last_name
          userdevice{
            identifier
            phone
            phone_token
            phone_type
            sensor
            sensor_type
          }
        }
        participant_status
      }
    }
      `;
		const variables = { ...req };
		client.query({
			query: query,
			fetchPolicy: "no-cache",
			variables: variables
		}).then((response: any) => {
			if (response.data) {
				dispatch(getSessionUserParticipant(response.data.sessionParticipantCheck));
			}
		}).catch((e: any) => {
			dispatch(getSessionUserParticipant(null));
		})
	}
}

export const ParticipentValid = (client: any, req: any) => {
	return (dispatch: any) => {
		const query = gql` 
    query sessionParticipantvalid($session_code: String!,$email:String!,
      $identifier: String!) {
        sessionParticipantvalid(session_code:$session_code,email:$email,
        identifier: $identifier) {
         message
          status
            participant{
            temp_email
            participant_id
            participant_status
            identifier
        }
      
      }
    }
      `;
		const variables = { ...req };

		client.query({
			query: query,
			fetchPolicy: "no-cache",
			variables: variables
		}).then((response: any) => {
			if (response.data) {
				dispatch(SessionParticipantValidate(response.data.sessionParticipantvalid.participant));
			}
		}).catch(() => {
			dispatch(SessionParticipantValidate(null));
		})
	}
};

export const sessionParticipantStatus = (client: any, req: any) => {
	return (dispatch: any) => {
		const query = gql` 
    query sessionParticipantStatus($session_code: String!,$email:String,
      $identifier: String!,$par_status:String!) {
       sessionParticipantStatus(session_code:$session_code,email:$email,
       identifier: $identifier,par_status:$par_status) {
         message
       
          }
        }
      `;
		const variables = { ...req };

		client.query({
			query: query,
			fetchPolicy: "no-cache",
			variables: variables
		}).then((response: any) => {

		}).catch(() => {

		})
	}
};

export const sessionParticipantemailCheck = (client: any, req: any) => {
	return (dispatch: any) => {
		const query = gql` 
    query sessionParticipantemailCheck($session_code: String!,$email:String!) {
      sessionParticipantemailCheck(session_code:$session_code,email:$email) {
        message
        status
        userDetails{
          username
          first_name
          last_name
        }
      }
    }
      `;
		const variables = { ...req };

		client.query({
			query: query,
			fetchPolicy: "no-cache",
			variables: variables
		}).then((response: any) => {
			if (response.data) {
				dispatch(getSessionParticipantMailCheck(response.data.sessionParticipantemailCheck));
			}
		}).catch((e: any) => {
			dispatch(getSessionParticipantMailCheck(null));
		})
	}
}

export const participantUpdateAttended = (client: any, req: any) => {
	return (dispatch: any) => {
		const query = gql` 
     query participantUpdateAttended($session_code: String!,
     $identifier: String!) {
       participantUpdateAttended(session_code:$session_code,
     identifier: $identifier) {
       message
       success
       error
           }
         }
       `;
		const variables = { ...req };

		client.query({
			query: query,
			fetchPolicy: "no-cache",
			variables: variables
		}).then((response: any) => {

		}).catch(() => {

		})
	}
};

export const participantUpdatePid = (client: any, req: any) => {
	return (dispatch: any) => {
		const query = gql` 
    query participantUpdatePid(
      $session_code: String!,
      $email:String,
      $identifier: String,
      $pid:String!) 
      {
        participantUpdatePid(
          session_code:$session_code,
          email:$email,
          identifier: $identifier,
          pid:$pid,
        ) {
          message
          success
          error
          }
      }
      `;
		const variables = { ...req };

		client.query({
			query: query,
			fetchPolicy: "no-cache",
			variables: variables
		}).then((response: any) => {

		}).catch(() => {

		})
	}
};
export const sendEmailTemplate = (client: any, request: any) => {
	return async (dispatch: any) => {
		let template_type = request.template_type;
		const sendEmailTemplate = gql`
      query sendEmailTemplate($template_type: String!, $objectData: JSON) {
      sendEmailTemplate(template_type: $template_type, objectData: $objectData) {
        message
        success
      }
    }
    `;
		client.query({
			query: sendEmailTemplate,
			fetchPolicy: "no-cache",
			variables: {
				template_type: template_type,
				objectData: request
			}
		}).then((response: any) => {
			dispatch(emailResponse(response.data));
		})
	}
}

// update track response
const updateTrackStatus = (item: any) => ({
	type: actionTypes.UPDATE_TRACK_STATUS,
	payload: item,
});

export const updateTrack = (client: any, request: any) => {
	return async (dispatch: any) => {
		let session_code = request.session_code;
		let email = request.email;
		let tenant_id = request.tenant_id ? request.tenant_id.toString() : null
		let statObj = request.statObj
		const query = gql` 
			query updateTrackState($session_code: String!, $participant_email: String!, $session_tenant: String, $statObj: JSON) {
				updateTrackState(session_code: $session_code, participant_email: $participant_email, session_tenant: $session_tenant, statObj: $statObj) {
					message
					success
					error
					data
				}
			}
		`;
		client.query({
			query: query,
			fetchPolicy: "no-cache",
			variables: {
				session_code: session_code,
				participant_email: email,
				session_tenant: tenant_id,
				statObj: statObj
			}
		}).then((response: any) => {
			dispatch(updateTrackStatus(response.data));
		}).catch((error: any) => {
			console.log("error ", error);
			
		})
	}
};