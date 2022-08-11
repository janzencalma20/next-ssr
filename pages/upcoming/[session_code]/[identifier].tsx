import React, { useEffect, useState } from "react";
import { Grid, Box, makeStyles, Button } from "@material-ui/core";
import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import moment from 'moment';
import axios from "axios";
import 'moment-timezone';
import {
  isMobile
} from "react-device-detect";
import SessionDetails from "components/session/SessionDetails";
import Config from '../../../config/config'
import {GetServerSideProps} from "next";
import store from "../../../store/store";
import {client} from "../../../ApolloProvider";
import {CheckSessionValid} from "../../../store/actions";
import {participantUpdateLastStep, sessionParticipantStatus} from "../../../store/actions/auth/auth";
import EventHeading from "../../../components/EventHeading";
import MESSAGES from "../../../helper/message";
import Head from "next/head";

const useStyles = makeStyles(() => ({
  title: {
    width: '100%',
    maxWidth: '850px',
    paddingTop: "40px",
    // fontSize: 64,
    // fontFamily: 'Spartan-bold',
    font: 'normal normal bold 70px/75px Spartan-bold',
    color: '#fff',
    textAlign: 'left',
    opacity: 1,
    letterSpacing: '0px',
    '@media (max-width: 767px)': {
      font: 'normal normal bold 36px/36px Spartan-bold',
      paddingTop: 0,
    },
    '@media (max-width: 568px)': {
      width: "259px",
    }
  },
  button: {
    width: 223,
    marginTop: '50px',
    height: 48,
    borderRadius: 6,
    backgroundColor: '#0179EE',
    textTransform: 'none',
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'roboto-regular',
    '&:hover': {
      backgroundColor: '#0f9fef'
    },
    '@media (max-width: 350px)': {
      marginTop: '10px',
    }
  },

}));

const createDynamicLinkBranchIO = async (params: any) => {
  return new Promise((resolve, reject) => {
    const dynamicLinkObj = {
      "branch_key": Config.branchio_key,
      "data": {
        "$sessioncode": params.sessioncode,
        "$webtoken": params.webtoken,
        "$sessiontype": params.sessiontype,
        "$email": params.email,
        "$pid": params.pid,
        "$env": Config.env,
        "$desktop_url": Config.CUSTOMER_URL + "deeplink/"
      },
    };
    axios.post(Config.branchio_url, dynamicLinkObj).then((result) => {
      resolve(result.data.url)
    }).catch(() => {

    })
  });
};

interface IProps {
  session_code: string,
  identifier: string,
  pid: string,
  session_title: string,
  description: string,
  image: string,
  siteName: string
}

const DirectUpcoming = (props: IProps) => {
  const classes = useStyles();
  const { session_code, pid, identifier, session_title, description, image, siteName } = props;
  const dispatch = useDispatch();
  // const session_code = props.match.params.session ? props.match.params.session : "";
  // const search = props.location.search;
  // const params = new URLSearchParams(search);
  // const pid = !!params.get('pid') ? params.get('pid') : !!props.location.state ? props.location.state.pid : null;
  // const identifier = props.match.params.identifier;
  const { sessionDetails, userData } = useSelector((state: any) => state.authUser);
  const [eventHeader, setEventHeader] = useState("");
  const [eventLine, setEventLine] = useState("");
  const [mainHeader, setMainHeader] = useState(MESSAGES.PAGE_TITLE.upcoming);
  const apolloClient = useSelector((state: any) => state.apolloClient);
  const [backgroundImg, setbackgroundImg] = useState('/assets/images/0.png');
  const [linkdata, setlinkdata] = useState('');
  // const linktype = props.location.state ? props.location.state.link : null;

  const eventDetails = {
    session_status: sessionDetails ? sessionDetails.session_status : "",
    location: sessionDetails ? sessionDetails.session_title : "",
    schedueTime: sessionDetails ? sessionDetails.session_status === "LIVE" ? sessionDetails.started_at : sessionDetails.session_status === "COMPLETED" ? sessionDetails.ended_at : sessionDetails.scheduled_start_at : "",
    endTime: sessionDetails && sessionDetails.scheduled_end_at ? sessionDetails.scheduled_end_at : null
  };

  useEffect(() => {
    let status = sessionDetails ? sessionDetails.session_status : null;
    if (status == "COMPLETED" || status == "CANCELLED") {
      window.location.replace(`/experience/completed/${session_code}/${identifier}`);
    }
    else if (status == "LIVE") {
      let redirecturl = `/${session_code}/${identifier}`;
      if (!!pid) {
        redirecturl = `/${session_code}/${identifier}?pid=` + pid
      } /*else if(linktype && linktype == 'typeB') {
        redirecturl = `/participant/${session_code}/`
      }*/
      window.location.replace(redirecturl)
    }
    setTimeout(() => {
      const request1 = { session_code: session_code };
      dispatch(CheckSessionValid(apolloClient.client, request1));
    }, 30000);
    if (sessionDetails && sessionDetails.category_background_url) {
      setbackgroundImg(sessionDetails.category_background_url);
    }
  }, [sessionDetails]);

  useEffect(() => {
    if (eventDetails) {
      const countDownDate = Number(eventDetails.schedueTime);
      if (countDownDate) {
        var x = setInterval(function () {
          var now = new Date().getTime();
          var distance = 0;
          if (sessionDetails && sessionDetails.session_status === "LIVE") {
            distance = now - countDownDate;
          } else {
            distance = countDownDate - now;
          }
          var days = Math.floor(distance / (1000 * 60 * 60 * 24));
          var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          var seconds = Math.floor((distance % (1000 * 60)) / 1000);
          let te = document.getElementById("demo")
          if (te) {
            te.innerHTML = pad(days) + ":" + pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
            if (distance < 0) {
              let request1 = { session_code: session_code };
              dispatch(CheckSessionValid(apolloClient.client, request1));
              clearInterval(x);
              te.innerHTML = pad(0) + ":" + pad(0) + ":" + pad(0) + ":" + pad(0);
            }
          }
        }, 1000)
      }
    }
    if (eventDetails.session_status) {
      switch (eventDetails.session_status) {
        case "LIVE":
          setEventHeader("Details of your live event:");
          setMainHeader("Live Experience");
          statusUpdate();
          lastStepUpdate("LIVE_PAGE");
          break;
        case "UPCOMING":
          setEventHeader("The experience you were invited to participate in has not yet begun.");
          setMainHeader("Upcoming Live Experience");
          lastStepUpdate("UPCOMING_PAGE");
          if (isMobile) {
            setEventLine("Open the Immersion Mobile app on your phone and join the experience at that time.")
          } else {
            setEventLine("Please open the Immersion Mobile app on your phone and join the experience at that time.")
          }
          break;
        case "COMPLETED":
          setEventHeader("Details of your completed event:");
          setMainHeader("Completed Experience");
          break;
        default:
          break;
      }
    }
  }, [eventDetails]);

  useEffect(() => {
    if (!!linkdata && linkdata != '' && isMobile == true) {
      window.location.href = linkdata;
      setlinkdata('')
    }
  }, [linkdata]);

  const openApp = async () => {
    let linkDatabranch: any = await createDynamicLinkBranchIO({
      sessioncode: session_code,
      sessiontype: sessionDetails.session_type
    });
    setlinkdata(linkDatabranch);
  };

  const pad = (n: any) => {
    return (n < 10) ? ("0" + n) : n;
  };

  const statusUpdate = async () => {
    if (userData && userData.username) {
      let req = { session_code: session_code, identifier: identifier, email: userData && userData.username ? userData.username : '', par_status: "LIVE" }
      await dispatch(sessionParticipantStatus(apolloClient.client, req))
    }
  };

  const lastStepUpdate = async (laststep: string) => {
    if (userData && userData.username) {
      let request: any = {
        session_code: session_code,
        email: userData && userData.username ? userData.username : '',
        last_step: laststep,
      };
      dispatch(participantUpdateLastStep(apolloClient.client, request))
    }
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
        <div className="directlive-container">
          <EventHeading backgroundImg={backgroundImg}>
            <Helmet title={mainHeader} />
            <div className="margin-left" >
              <div className={classes.title}>{eventHeader}</div>
            </div>
            <div className="groupBox margin-left" >
              <Box className="">
                <div>
                  <div className="main-description">
                    <p className="mb-0 mt-0 desc">{`${eventDetails.location} is set to open on:`} <br />{sessionDetails && sessionDetails.scheduled_start_at && moment.unix(sessionDetails.scheduled_start_at / 1000).format("MMMM D, YYYY")} at {sessionDetails && sessionDetails.scheduled_start_at && moment.unix(sessionDetails.scheduled_start_at / 1000).format("h:mmA z")}</p>
                  </div>
                  <p className='main-description'>{eventLine}</p>
                </div>
                {isMobile ?
                  <Grid container direction="row">
                    <Button type="button" className={classes.button} onClick={openApp}>Open App</Button>
                  </Grid>
                  : <></>
                }
                {eventDetails.session_status === "LIVE" ?
                  <Grid container className="mt-20 mb-20" direction="row">
                    <div className="bg-gray mt-20 event-btn">
                      <span className="count" id="demo" ></span>
                    </div>
                  </Grid>
                  :
                  eventDetails.session_status !== "COMPLETED" &&
                  <Grid container className="mt-20 mb-20" direction="row">
                    <div className="bg-gray mt-20 event-btn">
                      <span className="count" id="demo" ></span>
                    </div>
                  </Grid>
                }
              </Box>
            </div>
            <div className="bottom-image poweredimmersionLogo">
              <div className="txtImgBox">
                <h2 className="bottomText">Powered by</h2>
                <figure><img src="/assets/images/white-logo.png"></img></figure>
              </div>
              <span className="copyrighttext">&copy; 2022 Immersion Neuroscience Inc. All rights reserved.</span>
            </div>
          </EventHeading>
        </div>
      </SessionDetails>
    </>
  );
};

export default DirectUpcoming;

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
