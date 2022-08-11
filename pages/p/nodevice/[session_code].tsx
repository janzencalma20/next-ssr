import React, { useEffect, useState } from "react";
import { TextField } from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import moment from 'moment';
import SessionDetails from "components/session/SessionDetails";
import MESSAGES from "../../../helper/message";
import {CheckSessionValid, updateTrack} from "../../../store/actions/auth/auth";
import CustomSnackBar from "components/others/CustomSnackBar";
import {GetServerSideProps} from "next";
import store from "../../../store/store";
import {client} from "../../../ApolloProvider";
import Head from "next/head";
import {useRouter} from "next/router";

interface IProps {
  session_code: string,
  session_title: string,
  description: string,
  image: string,
  siteName: string
}

const NoDevice = (props: IProps) => {
  const { session_code, session_title, description, image, siteName } = props;
  const { sessionDetails, trackStatus } = useSelector((state: any) => state.authUser);
  const [loading, setLoading] = useState(true);
  const [errorMessage, seterrorMessage] = useState(String);
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();
  const [backgroundImg, setbackgroundImg] = useState('/assets/images/installpage-background.png');
  const apolloClient = useSelector((state: any) => state.apolloClient);
  const [snackAlertMsg, handleAlertMsg] = useState('');
  const [isShownSnackAlert, handleShownSnackAlert] = useState(false);
  const [snackAlertType, handleSnackAlertType] = useState("success");

  useEffect(() => {
    if (sessionDetails) {
      setLoading(false);
      let status = sessionDetails ? sessionDetails.session_status : null;
      if (status == "COMPLETED" || status == "CANCELLED") {
        router.push({
          pathname: `/experience/completed/${session_code}/`
        });
      }
      /* IMM_4381
      else if (status == "UPCOMING") {
          history.push(`/experience/upcoming/${session_code}/`,
              {
                  configdata: props.location.state ? props.location.state.configdata : null,
                  surveyLink: props.location.state ? props.location.state.surveyLink : null,
                  pid: pid,
                  link: 'typeB'
              });
      }*/
      setTimeout(() => {
        const request1 = { session_code: session_code };
        dispatch(CheckSessionValid(apolloClient.client, request1));
      }, 60000);

      if (sessionDetails.category_background_url) {
        setbackgroundImg(sessionDetails.category_background_url);
      }
    }
  }, [sessionDetails]);

  useEffect(() => {
    if (trackStatus && trackStatus.updateTrackState) {
      if (trackStatus.updateTrackState.success) {
        handleAlertMsg("Great, we'll stay in touch!");
        handleShownSnackAlert(true)
      } else {
        handleAlertMsg("Problem while track no device");
        handleSnackAlertType("error");
        handleShownSnackAlert(true)
      }
    }
  }, [trackStatus]);

  const onChangeHandler = ((e: React.ChangeEvent<HTMLInputElement>): void => {
    const input_name = e.currentTarget.name;
    const value = e.currentTarget.value;
    const errors: any = {};
    let validEmail = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (input_name === "email") {
      if (!value) {
        errors.email = MESSAGES.EMAIL.EMPTY;
      } else if (!validEmail.test(value)) {
        errors.email = MESSAGES.EMAIL.INVALID;
      }
      if (!errors.email) {
        setEmail(value);
        seterrorMessage('')
      } else {
        seterrorMessage(errors.email)
      }
    }
  });

  const submitHandler = (e: any) => {
    let req: any;
    const errors: any = {};
    if (email&&!errorMessage) {
      e.preventDefault();
      setLoading(true);
      req = {
        session_code: session_code,
        email: email.toLowerCase().trim(),
        statObj: {no_device_time: moment().utc().toISOString()}
      };
      dispatch(updateTrack(apolloClient.client, req));

      setTimeout(() => {
        window.location.href = "https://www.getimmersion.com";
      }, 2000);

    } else {
      e.preventDefault();
      if (!!errorMessage) {
        seterrorMessage(errorMessage)
      } else {
        errors.email = MESSAGES.EMAIL.EMPTY;
        seterrorMessage(errors.email)
      }
    }
  };

  const hideSnackAlert = () => {
    handleAlertMsg('');
    handleShownSnackAlert(false);
    window.location.replace('https://www.getimmersion.com')
  };

  const headerDivStyle = {
    backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${backgroundImg}')`,
    backgroundPosition: '0px 0px, 0px 0px',
    backgroundSize: 'auto, cover',
    backgroundRepeat: 'repeat, no-repeat',
    height: '100vh',
  };

  const emailInputStyle = {
    backgroundColor: '#f5f5f5',
    borderRadius: '10px',
    minWidth: '200px',
    width: '30vw',
    marginBottom: '10px',
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

      <SessionDetails session_code={session_code}>
        <div className="horzrule"></div>
        <div id="headersection" className="section wf-section headsect" style={headerDivStyle}>
          <div className="container-2 w-container"><img src={!!sessionDetails && !!sessionDetails.owner_profile_pic ? sessionDetails.owner_profile_pic : "/profile.png"} loading="lazy" alt="" className="image"/><img src={!!sessionDetails && !!sessionDetails.owner_company_logo ? sessionDetails.owner_company_logo : "/profile.png"} loading="lazy" alt="" className="image-2"/></div>
          <div className="container-3 w-container">
            <h2 className="invite-text">Bummer. <br/>Unfortunately you will need a smartwatch or fitness tracker to participate.</h2>
            <p className="paragraph">We&apos;re working on other ways for people to participate in the future. Would you like us to reach out to you when you can participate without a wearable device?</p>

            <TextField
              className="email-input"
              style={emailInputStyle}
              id="outlined-search"
              placeholder="Email"
              name="email"
              type="email"
              variant="outlined"
              onChange={onChangeHandler}
              error={!!errorMessage}
              helperText={errorMessage}
            />
            <a href="#" id="topSelectButton" onClick={(e) => submitHandler(e)} className="button-2 w-button">Notify Me</a>

          </div>
        </div>
        <CustomSnackBar type={snackAlertType} message={snackAlertMsg} open={isShownSnackAlert} onClose={hideSnackAlert} customColor="#51C79B" />
      </SessionDetails>
    </>
  )
};

export default NoDevice;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const session_code = query.session_code;
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
        session_title,
        description,
        image,
        siteName
      }))
    }
  }
};