import React, { forwardRef, useEffect, useState } from 'react';
import { Backdrop, CircularProgress, } from "@material-ui/core";
import { CheckSessionValid, userByIdentifier } from "../../store/actions"
import { useSelector, useDispatch } from 'react-redux';
import Config from '../../config/config';
import Home from 'pages';

const MainPage = forwardRef(({ session_code, identifier, children, ...rest }: any, ref) => {
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(true);
	const [interCom, setinterCom] = useState(true);
	const apolloClient = useSelector((state: any) => state.apolloClient);
	const { userData, sessionDetails, is_loaded } = useSelector((state: any) => state.authUser);

	useEffect(() => {
		if (session_code) {
			const request1 = {session_code: session_code};
			const request2 = {identifier: identifier, session_code: session_code};
			dispatch(CheckSessionValid(apolloClient.client, request1));
			if (identifier) {
				setLoading(true);
				dispatch(userByIdentifier(apolloClient.client, request2));
			}
		}
	}, [apolloClient.client, dispatch, session_code, identifier]);

	useEffect(() => {
		if (is_loaded) {
			setTimeout(() => {
				setLoading(false)
			}, 1000);
		}
	}, [sessionDetails, is_loaded]);

	useEffect(() => {
		let windowObject: any = window;
		if (windowObject?.Intercom && interCom) {
			windowObject.Intercom("shutdown");
			localStorage.removeItem('user_idetifier_data');
			deleteAllCookies()
		}
		if (userData && userData.username) {
			localStorage.setItem('user_idetifier_data', JSON.stringify(userData));
			localStorage.setItem("username", userData.first_name);
			localStorage.setItem("email", userData.username)
		}
		if (sessionDetails) {
			let userInfo: any = localStorage.getItem('userInfo');
			userInfo = JSON.parse(userInfo);
			let searchEmail = localStorage.getItem(`${session_code}-email`);
			let email = userData && userData.username ? userData.username : userInfo ? userInfo.email : searchEmail ? searchEmail : '';
			let name = (userData && userData.first_name ? userData.first_name : userInfo ? userInfo.firstname : '') + " " + (userData && userData.last_name ? userData.last_name : "");
			let created_at = userData && userData.created_at ? Math.floor(userData.created_at / 1000) : "";
			let usertype = email ? "ModParticipant-" + email : "ModParticipant";
			let experience = (sessionDetails && sessionDetails.session_title ? sessionDetails.session_title : "") + "(" + (session_code ? session_code : "") + ")";
			let experienceOwner = (sessionDetails && sessionDetails.owner_first_name ? sessionDetails.owner_first_name : "") + " " + (sessionDetails && sessionDetails.owner_last_name ? sessionDetails.owner_last_name : "");
			let devicetype = userData && userData.userdevice && userData.userdevice.sensor ? userData.userdevice.sensor : '';
			if(windowObject?.Intercom){
				setTimeout(() => {
					windowObject.Intercom('boot', {
						app_id: Config.intercomAppId,
						name: name, // Full name
						email: email, // Email address
						UserType: usertype,
						Experience: experience,
						Identifier: identifier ? identifier : '',
						created_at: created_at, // Signup date as a Unix timestamp
						ExperienceOwner: experienceOwner,
						DeviceType: devicetype
					});
					setinterCom(false)
				}, 2000);
			}
		} else {
			if(windowObject?.Intercom) {
				setTimeout(() => {
					windowObject.Intercom('boot', { app_id: Config.intercomAppId });
					setinterCom(false)
				}, 2000);
			}
		}
	}, [sessionDetails, userData]);

	const deleteAllCookies = () => {
		let cookies = document.cookie.split(";");
		for (let i = 0; i < cookies.length; i++) {
			let cookie = cookies[i];
			let eqPos = cookie.indexOf("=");
			let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
			document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
		}
	};

	return (
		<div>
			{loading ? (
				<div className="loader">
					<Backdrop open={loading} ><CircularProgress color="inherit" /></Backdrop>
				</div>
			) : (
				sessionDetails ? children : <Home />
			)}
		</div>
	);
});

MainPage.displayName = 'MainPage';

export default MainPage;