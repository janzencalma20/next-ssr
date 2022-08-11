import React, { useEffect, useState } from "react";
import { Button, Grid, } from "@material-ui/core";
import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import { isMobile } from "react-device-detect";
import { addLogToAws } from "../../config/awslog"
import MESSAGES from "../../helper/message";
import EventHeading from "components/EventHeading";
import SessionDetails from "components/session/SessionDetails";
import {
  CheckSessionValid,
  participantUpdateAttended,
  participantUpdateLastStep,
  participantUpdatePid,
  ParticipentValid,
  SendPushNotification, sessionUserParticipant
} from "../../store/actions/auth/auth";
import {GetServerSideProps} from "next";
import store from "../../store/store";
import {client} from "../../ApolloProvider";
import Head from "next/head";
import {useRouter} from "next/router";

interface IProps {
  session_code: string,
  identifier: string,
  pid: string,
  session_title: string,
  description: string,
  image: string,
  siteName: string
}

const PreEvent = (props: IProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { session_code, pid, identifier, session_title, description, image, siteName } = props;
  // const identifier = props.match.params.identifier ? props.match.params.identifier : "";
  // const session_code = props.match.params.session ? props.match.params.session : "";
  const apolloClient = useSelector((state: any) => state.apolloClient);
  let email: any = "";
  if (typeof window !== 'undefined') {
    email = localStorage.getItem("email") ? localStorage.getItem("email") : "";
  }
  // const search = props.location.search;
  // const params = new URLSearchParams(search);
  // const pid = !!params.get('pid') ? params.get('pid') : !!props.location.state ? props.location.state.pid : null;
  const [backgroundImg, setbackgroundImg] = useState('/assets/images/participant-background.png');
  const [divImg, setdivImg] = useState('')
  const [divText, setdivText] = useState('')
  const [clickText, setclickText] = useState('')

  const {
    userData,
    sessionDetails,
    UserParticipant,
    ParticioantDetails
  } = useSelector((state: any) => state.authUser);

  useEffect(() => {
    const status = sessionDetails ? sessionDetails.session_status : null;
    if (status == "COMPLETED" || status == "CANCELLED") {
      router.push({pathname: `/experience/completed/${session_code}/`});
    }
    setTimeout(() => {
      const request1 = { session_code: session_code };
      dispatch(CheckSessionValid(apolloClient.client, request1));
    }, 60000);
    if (sessionDetails && sessionDetails.category_background_url) {
      setbackgroundImg(sessionDetails.category_background_url);
    }
  }, [sessionDetails]);

  useEffect(() => {
    if (identifier) {
      const req1 = {
        session_code: String(session_code),
        identifier: String(identifier),
        email: email ? email : null
      }
      dispatch(sessionUserParticipant(apolloClient.client, req1))
      const request: any = {
        session_code: session_code,
        identifier: identifier,
        email: email,
        last_step: "TESTING_PAGE",
      }
      dispatch(participantUpdateLastStep(apolloClient.client, request))
    }

    if (userData && userData.userdevice) {
      if (userData.userdevice.sensor_type && userData.userdevice.sensor_type.toLowerCase().indexOf("watchos") != -1) {
        setdivImg('/assets/images/applescreen.png')
        setdivText('First, if you haven’t already, you’ll need to START DATA COLLECTION from your Apple Watch by opening the Immersion app on your WATCH and tapping the big green button.')
        setclickText('Once you’re collecting data, Click START to begin.')
      } else if (userData.userdevice.sensor_type && userData.userdevice.sensor_type.toLowerCase().indexOf("ble") != -1) {
        setdivImg('')
        setdivText('')
        setclickText('Click START to begin.')
      } else {
        setdivText('First, if data collection is not already started, you should turn it on your phone or device now. You can do that by tapping the sensor or graph icon on the top of your Immersion Mobile app on your phone.')
        isMobile ? setclickText('Then, click START below to begin.') : setclickText('Once you’re collecting data, click START to begin.')
      }
    }
  }, [identifier, session_code, userData]);

  useEffect(() => {
    if (UserParticipant && Object.keys(UserParticipant).length > 0) {
      if (UserParticipant.status == 200) {
        if (UserParticipant.userDetails.userdevice.identifier != identifier) {
          // let redirecturl = `/${session_code}/${UserParticipant.userDetails.userdevice.identifier}`
          if (!!pid) {
            // redirecturl = `/${session_code}/${UserParticipant.userDetails.userdevice.identifier}?pid=` + pid
          }
          window.location.replace(`/${session_code}/${UserParticipant.userDetails.userdevice.identifier}`)
        } else {
          if (UserParticipant.participant_status == "COMPLETED") {
            router.push({pathname: `/experience/completed/${session_code}/${identifier}`});
          }
          const req = {
            session_code: String(session_code),
            identifier: String(UserParticipant.userDetails.userdevice.identifier),
            email: String(UserParticipant.userDetails.username)
          }
          dispatch(ParticipentValid(apolloClient.client, req))
          const req1 = {
            session_code: String(session_code),
            identifier: String(UserParticipant.userDetails.userdevice.identifier)
          }
          dispatch(participantUpdateAttended(apolloClient.client, req1))
        }
      } else {
        window.location.replace(`/${session_code}`)
      }
    }
  }, [UserParticipant]);

  useEffect(() => {
    if (ParticioantDetails && Object.keys(ParticioantDetails).length > 0) {
      if (!!pid) {
        const req1: any = {
          session_code: session_code,
          identifier: identifier,
          pid: pid
        }
        dispatch(participantUpdatePid(apolloClient.client, req1))
      }
    }
  }, [ParticioantDetails]);

  const testConnection = () => {
    if (userData && userData.userdevice) {
      let type = "";
      if (userData.userdevice.phone.toLowerCase().indexOf("iphone") != -1) {
        type = "iphone"
      }
      else {
        type = "android"
      }
      let silent: any;
      let isAppleWatch = false;
      if (userData.userdevice.sensor_type.toLowerCase().indexOf("watchos") != -1) {
        silent = false
        isAppleWatch = true
      } else if (userData.userdevice.sensor_type.toLowerCase().indexOf("ble") != -1) {
        silent = true
      } else if (userData.userdevice.sensor_type.toLowerCase().indexOf("we") != -1) {
        silent = true
      } else {
        silent = true
      }
      const request: any = {
        message: "START",
        token: userData && userData.userdevice && userData.userdevice.phone_token ? userData.userdevice.phone_token : '',
        token_type: type,
        userschema: userData && userData.username ? userData.username : '',
        identifier: identifier,
        silent: silent,
        isapplewatch: isAppleWatch
      }
      if (!!request.token) {
        addLogToAws({ category: 'info', method: 'SendPushNotification', message: 'page:pre-event.tsx mod SendPushNotification params', data:request });
        dispatch(SendPushNotification(apolloClient.client, request))
      }
    }
    router.push({pathname: `/testing/${session_code}/${identifier}`});
  };

  return (
    <>
      <Head>
        <title>{session_title}</title>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <meta name="theme-color" content="#000000"/>
        <meta name="title" content={session_title} />
        <meta name="description" content={description} />
        <meta name="image" content={image} />
        <meta property="og:title" content={session_title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:site_name" content={siteName} />
        <meta name="twitter:title" content={session_title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ImmersionNeuro" />
        <meta name="twitter:creator" content="@ImmersionNeuro"/>
      </Head>

      <SessionDetails session_code={session_code} identifier={identifier}>
        <div className="pre-event-container">
          <Helmet title={MESSAGES.PAGE_TITLE.perTest} />
          <EventHeading backgroundImg={backgroundImg}>
            <div className="groupBox">
              <h3 className="text-center heading-text">Time to Start!</h3>
              <p className="main-description font-size-20">
                {`${sessionDetails && sessionDetails.owner_first_name ? sessionDetails.owner_first_name : ''} from ${sessionDetails && sessionDetails.owner_company ? sessionDetails.owner_company : ''} is asking you to watch ${sessionDetails ? sessionDetails.session_title : ""}.`}
              </p>
              <p className="main-description mb-10"> {!!divText && divText}</p>
              <>
                {!!divImg ? <div className="image-container">
                  {<img src={divImg} />}
                </div> : !!divText && <div className="image-container-empty-we"></div>}
              </>
              <p className="main-description under-image-text mb-10">
                {!!clickText && clickText}
              </p>
              <Grid container direction="row">
                <Button onClick={() => testConnection()} variant="contained" color="primary" className="ready-btn">Start</Button>
              </Grid>
            </div>
          </EventHeading>
          <div className="bottom-image poweredimmersionLogo">
            <div className="txtImgBox">
              <h2 className="bottomText">Powered by</h2>
              <figure><img src="/assets/images/white-logo.png"></img></figure>
            </div>
            <span className="copyrighttext">&copy; 2022 Immersion Neuroscience Inc. All rights reserved.</span>
          </div>
        </div>
      </SessionDetails>
    </>
  );
};

export default PreEvent;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const session_code = query.session_code;
  let identifier = null;
  let pid = null;
  if (query && query.identifier) {
    identifier = query.identifier;
  }
  if (query && query.pid) {
    pid = query.pid;
  }
  let session_title, description, image, siteName = '';

  const request = { session_code: session_code };
  try {
    const res: any = await store.dispatch(CheckSessionValid(client, request, true));
    if (res) {
      session_title = res.session_title;
      description = `Ever wonder what’s going on in your brain? Join this event & see if your brain loves it. Thanks, ${res.owner_first_name ? res.owner_first_name : 'Someone'} @ ${res.department_alias ? res.department_alias : 'A company you know'}`;
      image = res.large_thumbnail ? res.large_thumbnail : res.category_background_url;
      siteName = `${res.owner_company ? res.owner_company : 'Check this out'} (via GetImmersion.com)`
    }
    return {
      props: JSON.parse(JSON.stringify({
        session_code,
        pid,
        identifier,
        session_title,
        description,
        image,
        siteName
      }))
    }
  } catch (e) {
    return {
      props: JSON.parse(JSON.stringify({
        session_code,
        pid,
        identifier,
        session_title,
        description,
        image,
        siteName
      }))
    }
  }
};