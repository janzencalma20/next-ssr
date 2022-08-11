import React, { useEffect, useState } from "react";
import { Button, Grid, Backdrop, CircularProgress } from "@material-ui/core";
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { isMobile } from "react-device-detect";
import EventHeading from "../../components/EventHeading";
import MESSAGES from "../../helper/message";
import SessionDetails from "components/session/SessionDetails";
import {CheckSessionValid, SignUpUser} from "../../store/actions";
import StyledTextField from "../../components/StyledTextField";
import {GetServerSideProps} from "next";
import store  from '../../store/store';
import {client} from '../../ApolloProvider';
import Head from "next/head";
import {useRouter} from "next/router";

interface IProps {
  session_code: string,
  pid: string,
  session_title: string,
  description: string,
  image: string,
  siteName: string
}

const SignUpPage = (props: IProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { session_code, pid, session_title, description, image, siteName } = props;
  const [loading, setLoading] = useState(false);
  const { userInfo, sessionDetails, is_loaded } = useSelector((state: any) => state.authUser);
  const [errorMessage, seterrorMessage] = useState(String);
  const [backgroundImg, setbackgroundImg] = useState('/assets/images/participant-background.png');
  const [skip, setSkip] = useState(false);

  const dta = {
    first_name: "",
    last_name: "",
    email: ""
  };
  const [formState, setFormState] = useState(dta);
  const apolloClient = useSelector((state: any) => state.apolloClient);

  useEffect(() => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem(`${session_code}-email`);
  }, []);

  useEffect(() => {
    if (is_loaded) {
      setLoading(false)
    }
    const status = sessionDetails ? sessionDetails.session_status : null;
    if (status == "COMPLETED" || status == "CANCELLED") {
      router.push({pathname: `/experience/completed/${session_code}`});
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
    if (is_loaded) {
      setLoading(false)
    }
    if (sessionDetails && loading) {
      const status = sessionDetails.session_status;
      if (status === "COMPLETED") {
        router.push({pathname: `/experience/completed/${session_code}`});
      }
      if (userInfo) {
        setLoading(false);
        localStorage.setItem("username", userInfo.firstname);
        localStorage.setItem("email", userInfo.email);
        if ((userInfo.install_page || !userInfo.identifier) && status !== "COMPLETED") {
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          router.push({
            pathname: `/install/${session_code}`,
            query: { userInfo: userInfo, pid: pid, skip: skip }
          });
        } else if (userInfo.identifier) {
          localStorage.setItem("identifier", userInfo.identifier);
          switch (status) {
            case "LIVE":
              router.push({
                pathname: `/${session_code}/${userInfo.identifier}`,
                query: { pid: pid }
              });
              break;
            case "UPCOMING":
              router.push({
                pathname: `/upcoming/${session_code}/${userInfo.identifier}`,
                query: { pid: pid }
              });
              break;
            case "COMPLETED":
              router.push({
                pathname: `/experience/completed/${session_code}/${userInfo.identifier}`
              });
              break;
            default:
              break;
          }
        }
      }
    }
  }, [userInfo, sessionDetails, is_loaded]);

  const submitHandler = (e: any) => {
    let req: any;
    const errors: any = {};
    if (e.currentTarget.id == 'skip-btn') {
      setLoading(true);
      setSkip(true);
      const uuid = uuidv4();
      const email = `${uuid}@getimmersion.com`;
      req = {
        pid: '',
        session_code: session_code,
        lastname: '',
        firstname: '',
        email: email
      };
      dispatch(SignUpUser(apolloClient.client, req));
    } else {
      if (formState.email && !errorMessage) {
        e.preventDefault();
        setLoading(true);
        req = {
          pid: pid ? pid : null,
          session_code: session_code,
          lastname: formState.last_name,
          firstname: formState.first_name,
          email: formState.email.toLowerCase().trim()
        };
        dispatch(SignUpUser(apolloClient.client, req));
      } else {
        e.preventDefault();
        if (!!errorMessage) {
          seterrorMessage(errorMessage)
        } else {
          errors.email = MESSAGES.EMAIL.EMPTY;
          seterrorMessage(errors.email)
        }
      }
    }
  };

  const onChangeHandler = ((e: React.ChangeEvent<HTMLInputElement>): void => {
    const input_name = e.currentTarget.name;
    const value = e.currentTarget.value;
    const errors: any = {};
    setFormState((current) => ({ ...current, [input_name]: value }));
    const validEmail = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (input_name === "email") {
      if (!value) {
        errors.email = MESSAGES.EMAIL.EMPTY;
      } else if (!validEmail.test(value)) {
        errors.email = MESSAGES.EMAIL.INVALID;
      }
      if (!errors.email) {
        seterrorMessage('')
      } else {
        seterrorMessage(errors.email)
      }
    }
  });

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
        <div className="signup-container ">
          <EventHeading backgroundImg={backgroundImg}>
            <div className="groupBox">
              {!isMobile ?
                <h3 className="profile-title top-profile-title" >Let’s Get This Party Started!</h3>
                :
                <>
                  <h3 className="profile-title top-profile-title" >Let’s Get This</h3>
                  <h3 className="profile-title" >Party Started!</h3>
                </>
              }
              <div className="peraGroup">
                <p className="main-description" >{`${sessionDetails && sessionDetails.owner_first_name ? sessionDetails.owner_first_name : ''} from ${sessionDetails && sessionDetails.owner_company ? sessionDetails.owner_company : ''} is asking for your help with an experience they created.`} </p>
                <p className="main-description" >Enter your name & email below and let’s get started.</p>
              </div>
              <form onSubmit={submitHandler} className="participant-form">
                <Grid container spacing={3}>
                  <Grid item md={6} sm={12}>
                    <StyledTextField autoComplete="off" margin="normal" fullWidth label="First Name" name="first_name" onChange={onChangeHandler} />
                  </Grid>
                  <Grid item md={6} sm={12}>
                    <StyledTextField autoComplete="off" margin="normal" fullWidth label="Last Name" name="last_name" onChange={onChangeHandler} />
                  </Grid>
                  <Grid item md={12} sm={12}>
                    <StyledTextField margin="normal" autoComplete='off' fullWidth label="Your Email Address" name="email" type="email" onChange={onChangeHandler} />
                  </Grid>
                </Grid>
                <Grid>{errorMessage && errorMessage != '' ? <span className="error">{errorMessage}</span> : null}</Grid>
                <Grid container spacing={1}>
                  <div className="formBottomGroup">
                    <p className="link" id="skip-btn" onClick={submitHandler}>Skip</p>
                    <Button className="next-btn" type="submit" variant="contained" color="primary" size="small"> Next</Button>
                  </div>
                </Grid>
              </form>
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
        {loading &&
        <div className="loader">
          <Backdrop open={loading} ><CircularProgress color="inherit" /></Backdrop>
        </div>
        }
      </SessionDetails>
    </>
  );
};

export default SignUpPage;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const session_code = query.session_code;
  let pid = null;
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
        session_title,
        description,
        image,
        siteName
      }))
    }
  }
};