import React, { useEffect, useState } from "react";
import { Grid, Button } from "@material-ui/core";
import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment"
import { Line } from 'rc-progress';
import {
  isMobile
} from "react-device-detect";
import {GetServerSideProps} from "next";
import store from "../../../store/store";
import {client} from "../../../ApolloProvider";
import {CheckSessionValid, getMeasurement} from "../../../store/actions";
import MESSAGES from "../../../helper/message";
import EventHeading from "components/EventHeading";
import SessionDetails from "components/session/SessionDetails";
import CustomSnackBar from "components/others/CustomSnackBar";
import {SendPushNotification} from "../../../store/actions/auth/auth";
import {addLogToAws} from "../../../config/awslog";
import Head from "next/head";
import {useRouter} from "next/router";
var x: any;

interface IProps {
  session_code: string,
  identifier: string,
  session_title: string,
  description: string,
  image: string,
  siteName: string
}

const PendingEvent = (props: IProps) => {
  const { session_code, identifier, session_title, description, image, siteName } = props;
  const dispatch = useDispatch();
  const router = useRouter();
  const apolloClient = useSelector((state: any) => state.apolloClient);
  const { measurement = [], emailResponse, is_loaded, userData, sessionDetails } = useSelector((state: any) => state.authUser);
  const [snackAlertMsg, handleAlertMsg] = useState('');
  const [isShownSnackAlert, handleShownSnackAlert] = useState(false);
  const [snackAlertType, handleSnackAlertType] = useState("success");
  const [min, setMin] = useState(0);
  const [inter, setInter] = useState(0);
  const [currentTime, setcurrentTime] = useState(new Date().getTime());
  const [FormTime] = useState(moment().unix());
  const [backgroundImg, setbackgroundImg] = useState('/assets/images/installpage-background.png');
  const [barColor, setBarColor] = useState('');
  const [linkdata] = useState('')
  const [progress, setProgress] = React.useState(0);
  const [title, setTitle] = useState('');
  const [subtitle, setsubtitle] = useState('This can take a couple seconds, but once everything is ready, you will be automatically entered into the experience.');
  const [tryAgain, settryAgain] = useState(false);
  const [strokeColor, setstrokeColor]=useState('#3D7FDA');

  useEffect(() => {
    let totalSeconds: any = 0;
    setcurrentTime(new Date().getTime())
    x = setInterval(function () {
      let per: any = 0;
      var now = new Date().getTime();
      var distance = 0;
      distance = now - currentTime;
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      setMin(minutes)
      totalSeconds += 1;
      setProgress((totalSeconds / 120) * 100)
      if (minutes >= 2) {
        setProgress(100)
        clearInterval(x);
      }
    }, 1000)
    setInter(x)
  }, []);

  useEffect(() => {
    getMeasurment()
  }, [identifier])

  useEffect(() => {
    if (!!linkdata && linkdata != '' && isMobile == true) {
      window.location.href = linkdata
    }
  }, [linkdata]);

  useEffect(() => {
    if (!measurement || (measurement && measurement.length < 10)) {
      if (measurement.length < 10 && min >= 2) {
        setBarColor('barClassFail');
        setstrokeColor('#ed564a')
        settryAgain(true)
        setTitle('<span>BUMMER!</span>')
        setsubtitle('We’re having some trouble connecting you. Click below to try again or click the chatbot in the right of the screen for some help.')
      }
      setTimeout(function () {
        getMeasurment()
      }, 3000)
    }
    let status = sessionDetails ? sessionDetails.session_status : null;
    if (measurement.length >= 10) {
      setBarColor('barClassGreen');
      setstrokeColor('#1db859')
      setTitle('<span>SUCCESS!</span>')
      setsubtitle('Your content will load any second.')
      clearInterval(x)
      setProgress(100)
      setTimeout(() => {
        !!inter && clearInterval(inter)
        switch (status) {
          case "LIVE":
            router.push({
              pathname: `/live/${session_code}/${identifier}`
            });
            break;
          case "UPCOMING":
            let type = "";
            if (userData && userData.userdevice && userData.userdevice.phone.toLowerCase().indexOf("iphone") != -1) {
              type = "iphone"
            }
            else {
              type = "android"
            }
            const request = {
              message: "STOP",
              userschema: userData && userData.username ? userData.username : '',
              token: userData && userData.userdevice && userData.userdevice.phone_token ? userData.userdevice.phone_token : '',
              token_type: type,
              silent: true,
              identifier: identifier
            }
            if (!!request.token) {
              addLogToAws({ category: 'info', method: 'SendPushNotification', message: 'page:PendingEvent.tsx mod SendPushNotification params', data:request });
              dispatch(SendPushNotification(apolloClient.client, request))
            }
            router.push({
              pathname: `/upcoming/${session_code}/${identifier}`
            });

            break;
          case "COMPLETED":
            router.push({
              pathname: `/withoutsurvey/completed/${session_code}/${identifier}`
            });
            break;
          default:
            break;
        }
      }, 1000)
    }
  }, [measurement]);

  useEffect(() => {
    const status = sessionDetails ? sessionDetails.session_status : null;

    if (status == "COMPLETED" || status == "CANCELLED") {
      router.push({
        pathname: `/experience/completed/${session_code}/`
      });
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
    if (is_loaded && emailResponse) {
      handleAlertMsg(emailResponse.sendEmailTemplate.success ? 'Email has been sent successfully' : 'Email has been not sent successfully');
      handleSnackAlertType(emailResponse.sendEmailTemplate.success ? "success" : "error");
      handleShownSnackAlert(true);
    }
  }, [emailResponse, is_loaded]);

  const hideSnackAlert = () => {
    handleAlertMsg('');
    handleShownSnackAlert(false);
  };

  const redirect_conn_page = () => {
    const redirecturl = `/${session_code}/${identifier}`;
    window.location.replace(redirecturl)
  };

  const getMeasurment = () => {
    const totime = moment().unix();
    const req = {
      to: totime,
      from: FormTime,
      identifier: identifier
      // to: 1613385986,
      // from: 1613379675,
      // identifier: "d33eq6v"
    };
    dispatch(getMeasurement(apolloClient.client, req));
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
        <div className="pending-event-container">
          <Helmet title={MESSAGES.PAGE_TITLE.testConnection} />
          <EventHeading backgroundImg={backgroundImg}>
            <div className="groupBox">
              <h3 className="text-center heading-text">Testing Your Connection…</h3>
              <Grid className={barColor}>
                <Line percent={progress} strokeWidth={10} trailWidth={10} strokeColor={strokeColor} />
              </Grid>
              <Grid container className="main-description" direction="row">
                <span id="event_title" className="event_title" dangerouslySetInnerHTML={{ __html: title }}></span>
                <p className="event-desc" style={{ marginBottom: "15px" }} dangerouslySetInnerHTML={{ __html: subtitle }}>
                </p>
                {tryAgain ?
                  <div className="mb-20 mt-20 text-center">
                    <Button variant="contained" color="primary" className='try_btn' onClick={redirect_conn_page}><p className='try_btn_text'>Try Again</p></Button>
                  </div> : <></>
                }
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
          <CustomSnackBar type={snackAlertType} message={snackAlertMsg} open={isShownSnackAlert} onClose={hideSnackAlert} />
        </div>
      </SessionDetails>
    </>
  );
};

export default PendingEvent;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const session_code = query.session_code;
  const identifier = query.identifier;
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
        identifier,
        session_title,
        description,
        image,
        siteName
      }))
    }
  }
};
