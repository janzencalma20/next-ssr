import * as actionTypes from "../../actions/actionTypes";
import { updateObject } from "../../shared/utility";

const initialState = {
  loading: false,
  is_loaded: false,
  userInfo: "",
  sessionDetails: null,
  emailSend: false,
  measurement: [],
  userData: [],
  UserWebtoken: {},
  UserParticipant: {},
  ParticioantDetails: {},
  UserDevice: {},
  EmailParticipant: {},
  trackStatus: null
};

const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.SIGNUP_SUCCEED:
      return updateObject(state, {
        userInfo: action.payload,
        is_loaded: true,
        loading: false,
      });

    case actionTypes.SESSION_VALID:
      return updateObject(state, {
        sessionDetails: action.payload,
        is_loaded: true,
        loading: false,
      });

    case actionTypes.SEND_EMAIL:
      return updateObject(state, {
        emailSend: action.payload,
        is_loaded: true,
        loading: false,
      });

    case actionTypes.MEASUREMENTS:
      return updateObject(state, {
        measurement: action.payload,
        is_loaded: true,
        loading: false,
      });

    case actionTypes.GET_USER:
      return updateObject(state, {
        userData: action.payload,
        is_loaded: true,
        loading: false,
      });

    case actionTypes.GET_WEBTOKEN:
      return updateObject(state, {
        UserWebtoken: action.payload,
        is_loaded: true,
        is_loading: false,
      });

    case actionTypes.GET_SESSION_USER_PARTICIPANT:
      return updateObject(state, {
        UserParticipant: action.payload,
        is_loaded: true,
        is_loading: false,
      });

    case actionTypes.PARTICIPANT_VALID:
      return updateObject(state, {
        ParticioantDetails: action.payload,
        is_loaded: true,
        is_loading: false,
      });

    case actionTypes.USER_DEVICE:
      return updateObject(state, {
        UserDevice: action.payload,
        is_loaded: true,
        is_loading: false,
      });

    case actionTypes.GET_SESSION_PARTICIPANT_EMAIL:
      return updateObject(state, {
        EmailParticipant: action.payload,
        is_loaded: true,
        is_loading: false,
      });

    case actionTypes.UPDATE_SEND_EMAIL:
      return updateObject(state, {
        emailSend: action.payload,
        is_loaded: true,
        loading: false,
      });

    case actionTypes.EMAIL_RESPONSE:
      return updateObject(state, {
        emailResponse: action.payload,
        emailSend: action.payload.sendEmailTemplate.success,
        is_loaded: true,
      });

    case actionTypes.UPDATE_TRACK_STATUS:
      return updateObject(state, {
        trackStatus: action.payload,
        is_loaded: true,
      });

    default:
      return state;
  }
};

export default reducer;