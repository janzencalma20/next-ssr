import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  TextField,
  IconButton
} from "@material-ui/core";
import { Helmet } from "react-helmet";
import Config from '../../config/config';
import {
  isMobile
} from "react-device-detect";
import moment from "moment";

import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {GetServerSideProps} from "next";
import store from "../../store/store";
import {client} from "../../ApolloProvider";
import MESSAGES from "helper/message";
import SessionDetails from "components/session/SessionDetails";
import EventHeading from "components/EventHeading";
import {CheckSessionValid, SendEmailMe} from "../../store/actions";
import {
  GetWebToken,
  participantUpdatePid, SendEmailMobile,
  sessionParticipantemailCheck,
  updateTrack,
  WebSession
} from "../../store/actions/auth/auth";
import CustomSnackBar from "components/others/CustomSnackBar";
import Head from "next/head";
import {useRouter} from "next/router";
var CryptoJS = require("crypto-js");

const createDynamicLinkBranchIO = async (params: any) => {
  document.title = MESSAGES.PAGE_TITLE.installPage
  return new Promise((resolve, reject) => {
    const dynamicLinkObj = {
      "branch_key": Config.branchio_key,
      "campaign": params.campaign,
      "channel": params.channel,
      "feature": Config.env,
      "stage": params.stage,
      "data": {
        "$sessioncode": params.sessioncode,
        "$webtoken": params.webtoken,
        "$sessiontype": params.sessiontype,
        "$email": params.email,
        "$pid": params.pid,
        "$env": Config.env,
        "$desktop_url": Config.CUSTOMER_URL + "deeplink/"

      }
    };
    axios.post(Config.branchio_url, dynamicLinkObj).then((result) => {
      resolve(result.data.url)
    }).catch(() => {

    })
  });
};

interface IProps {
  session_code: string,
  pid: string,
  session_title: string,
  description: string,
  image: string,
  siteName: string,
  searchemail: string,
  skip: any,
  link: string,
  deeplinkB: string,
  linkwebtoken: string,
  data: any,
  configdata: any,
  surveyLink: any
}

const Install = (props: IProps) => {
  const {
    session_code, pid, session_title, description, image, siteName, searchemail, skip, link, deeplinkB, linkwebtoken,
    data, configdata, surveyLink
  } = props;
  // const session_code = props.match.params.session ? props.match.params.session : "";
  let loginUserData: any = "";
  if (typeof window !== 'undefined') {
    loginUserData = localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo") || "{}") : ""
  }
  // const search = props.location.search;
  // const params = new URLSearchParams(search);
  // const pid = !!params.get('pid') ? params.get('pid') : !!props.location.state ? props.location.state.pid : null;
  const [pidvalue, setPidvalue] = useState(pid)
  // const searchemail = params.get('email');
  const [showModalemail, setShowModalemail] = useState(false);
  const [sendLinkEmail, setsendLinkEmail] = useState("");
  const [validEmail, setvalidEmail] = useState(false);
  // const skip = !!props.location.state ? props.location.state.skip : false;
  // const [link] = useState(!!props.location.state ? props.location.state.link : null);
  // const [deeplinkB] = useState(!!props.location.state ? props.location.state.deeplinkB : null);
  // const [linkwebtoken] = useState(!!props.location.state ? props.location.state.webtoken : null);
  const user = {
    firstname: "",
    lastname: "",
    identifier: "",
    session_status: "",
    email: ""
  };
  const [userDetails, setUserDetails] = useState(user);
  const [phoneType] = useState(1);
  const router = useRouter();
  const dispatch = useDispatch();
  const apolloClient = useSelector((state: any) => state.apolloClient);
  const { emailSend, EmailParticipant, is_loaded, sessionDetails, UserWebtoken } = useSelector((state: any) => state.authUser);
  const [loading] = useState(false)
  const [snackAlertMsg, handleAlertMsg] = useState('');
  const [isShownSnackAlert, handleShownSnackAlert] = useState(false);
  const [snackAlertType, handleSnackAlertType] = useState("success");
  const [currTime, setcurrTime] = useState(new Date().getTime());
  const [minutes, setMinutes] = useState(0);
  const [linkdata, setlinkdata] = useState('')
  const [webtokenInterval, setwebtokenInterval] = useState(false);
  const [backgroundImg, setbackgroundImg] = useState('/assets/images/installpage-background.png');
  const [showModal, setShowModal] = useState(false);
  const [QRlinkdata, setQRlinkdata] = useState('')
  const QRCode = require('qrcode.react');
  let validEmailRegex = /^(([^<>()\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const decrypt = (data: any) => {
    return CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
  };
  // const [data] = useState(params.get('data'));
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${session_code}-email`, searchemail ? searchemail.toLowerCase().trim() : '')
    localStorage.setItem(`${session_code}-data`, data ? data : '')
  }
  const [webtoken, setgetwebtoken] = useState<any>();

  const makeid = (length: number) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const emailMe = async () => {
    let obj = {
      sessioncode: session_code,
      webtoken: webtoken,
      sessiontype: "MODERATED",
      email: !!sendLinkEmail ? encodeURIComponent(sendLinkEmail) : userDetails && userDetails.email ? encodeURIComponent(userDetails.email) : '',
      pid: pidvalue,
      channel: !!sessionDetails ? sessionDetails.owner_company : '',
      stage: !!sessionDetails ? sessionDetails.session_status : '',
      campaign: session_code
    }
    let linkDataBranchio: any = !!deeplinkB ? deeplinkB : await createDynamicLinkBranchIO(obj);
    setlinkdata(linkDataBranchio)
    if (isMobile == false) {
      const req = {
        session_code: session_code,
        type: phoneType,
        firstname: userDetails.firstname,
        email: !!sendLinkEmail ? sendLinkEmail : userDetails.email,
        deepLink: linkDataBranchio,
        deeplink_and: linkDataBranchio,
      };
      dispatch(SendEmailMe(apolloClient.client, req));
      setShowModalemail(false)
      setsendLinkEmail("")
    } else {
      dispatch(SendEmailMobile(true))
    }
  }

  useEffect(() => {
    setcurrTime(new Date().getTime())
    if (searchemail) {
      if (searchemail) {
        let req = { session_code: session_code, email: searchemail.toLowerCase().trim() }
        dispatch(sessionParticipantemailCheck(apolloClient.client, req));
      }
      if (data) {
        let webdata = JSON.parse(decrypt(data));
        setPidvalue(webdata && webdata.pid ? webdata.pid : null)
        let wt: any = webdata && webdata.webtoken ? webdata.webtoken : makeid(8)
        setgetwebtoken(wt)
        let req1 = {
          session_code: session_code,
          webtoken: wt,
          email: searchemail.toLowerCase().trim()
        };
        dispatch(WebSession(apolloClient.client, req1));
      }
    } else if (loginUserData) {
      const user = {
        firstname: loginUserData.firstname,
        lastname: loginUserData.lastname,
        identifier: loginUserData.identifier,
        session_status: loginUserData.session_status,
        email: searchemail ? searchemail.toLowerCase().trim() : loginUserData.email
      }
      let wt: any = makeid(8)
      setgetwebtoken(wt)
      let req1 = {
        session_code: session_code,
        webtoken: wt,
        email: loginUserData.email
      };
      dispatch(WebSession(apolloClient.client, req1));
      setUserDetails(user)
    } else if(!!link) {
      if(!!linkwebtoken) {
        setgetwebtoken(linkwebtoken)
        let req1 = {
          session_code: session_code,
          webtoken: linkwebtoken
        };
        dispatch(WebSession(apolloClient.client, req1));
      }
    } else {
      window.location.replace(`/${session_code}`);
    }

    let windowObject: any = window
    if (windowObject?.Intercom) {
      windowObject.Intercom("shutdown")
    }

  }, []);

  useEffect(() => {
    if (!!linkdata && linkdata != '' && isMobile == true) {
      let req = {
        session_code: session_code,
        email: userDetails && userDetails.email,
        statObj: { "link_clicked_time": moment().utc().toISOString() }
      }
      dispatch(updateTrack(apolloClient.client, req))
      window.location.href = linkdata
      setlinkdata('')
    }
  }, [linkdata]);

  useEffect(() => {
    let status = sessionDetails ? sessionDetails.session_status : null;

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
    if (is_loaded && emailSend && isMobile == false) {
      handleAlertMsg(emailSend.message);
      handleSnackAlertType(emailSend.success ? "success" : "error");
      handleShownSnackAlert(true);
    }
  }, [emailSend, is_loaded]);

  const getWebtoken = (webtoken: any) => {
    const req = {
      webtoken: webtoken,
      session_code: session_code
    }
    dispatch(GetWebToken(apolloClient.client, req));
  };

  useEffect(() => {
    if (EmailParticipant) {
      if (EmailParticipant.status == 400) {
        router.push({pathname: `/${session_code}`});
      }
      else {
        if (searchemail) {
          const user = {
            firstname: EmailParticipant && EmailParticipant.userDetails ? EmailParticipant.userDetails.first_name : '',
            lastname: EmailParticipant && EmailParticipant.userDetails ? EmailParticipant.userDetails.last_name : '',
            identifier: '',
            session_status: loginUserData.session_status,
            email: searchemail.toLowerCase().trim()
          }
          setUserDetails(user)
        }
      }
    }
  }, [EmailParticipant]);

  useEffect(() => {
    let now = new Date().getTime();
    let distance = 0;
    distance = now - currTime;
    var min = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    setMinutes(min)
    if (minutes >= 20) {
      window.location.replace(`/${session_code}`)
    }
    if (UserWebtoken && Object.keys(UserWebtoken).length > 0) {
      if (UserWebtoken.identifier == null) {
        if (webtokenInterval == false) {
          setwebtokenInterval(true)
          setInterval(() => {
            getWebtoken(UserWebtoken ? UserWebtoken.webtoken : null)
          }, 3000)
        }
      } else {
        if (UserWebtoken.identifier) {
          openPreEvent()
        }
      }
    }
  }, [UserWebtoken]);

  useEffect(() => {
    let windowObject: any = window
    var email = userDetails.email ? userDetails.email : ""
    var name = (userDetails.firstname ? userDetails.firstname : "") + " " + (userDetails.lastname ? userDetails.lastname : "")
    if (!!pid) {
      let req1: any = {
        session_code: session_code,
        email: userDetails && userDetails.email ? userDetails.email : '',
        pid: pid
      }
      dispatch(participantUpdatePid(apolloClient.client, req1))
    }
    if(windowObject?.Intercom){
      setTimeout(() => {
        windowObject.intercomSettings = {}
        windowObject.Intercom('boot', { app_id: Config.intercomAppId, name: name, email: email })
      }, 2000);
    }
  }, [userDetails]);

  const openPreEvent = () => {
    if (userDetails) {
      let identifier = UserWebtoken.identifier ? UserWebtoken.identifier : userDetails.identifier
      let status = sessionDetails ? sessionDetails.session_status : null;
      switch (status) {
        case "LIVE":
          router.push({
            pathname: `/${session_code}/${identifier}`,
            query: { pid: pidvalue }
          });
          break;
        case "UPCOMING":
          router.push({
            pathname: `/upcoming/${session_code}/${identifier}`,
            query: { configdata: configdata ? configdata : null, surveyLink: surveyLink ? surveyLink : null, pid: pidvalue }
          });
          break;
        case "COMPLETED":
          router.push({
            pathname: `/experience/completed/${session_code}/${identifier}`
          });
          break;

        default:
          break;
      }
    }
  }

  function hideSnackAlert() {
    handleAlertMsg('');
    handleShownSnackAlert(false);
  }

  const stayHideLink = async () => {
    let obj = {
      sessioncode: session_code,
      webtoken: webtoken,
      sessiontype: "MODERATED",
      email: !!sendLinkEmail ? encodeURIComponent(sendLinkEmail) : userDetails && userDetails.email ? encodeURIComponent(userDetails.email) : '',
      pid: pidvalue,
      channel: !!sessionDetails ? sessionDetails.owner_company : '',
      stage: !!sessionDetails ? sessionDetails.session_status : '',
      campaign: session_code
    }

    let linkDatabranch: any = await createDynamicLinkBranchIO(obj);
    setQRlinkdata(linkDatabranch);
    setShowModal(true);
  }
  const closeQRModal = () => {
    setShowModal(false);
  };
  const checkValidataEmail = (emailsting: any) => {
    setsendLinkEmail(emailsting)
    if (!emailsting) {
      setvalidEmail(false)
    } else if (!validEmailRegex.test(emailsting)) {
      setvalidEmail(false)
    } else {
      setvalidEmail(true)
    }
  }
  const handleChangeEmail = (event: any) => {
    checkValidataEmail(event.target.value)
  }

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

      <SessionDetails session_code={session_code} >
        <div className="install-container">
          <Helmet title={MESSAGES.PAGE_TITLE.installPage} />
          <EventHeading backgroundImg={backgroundImg}>
            <div className="groupBox">
              <h3 className="text-center heading-text">
                {isMobile ?
                  "Let's Switch to the Mobile App"
                  :
                  "Time to Switch to Your Phone"
                }
              </h3>
              <p className="main-description">
                {isMobile ?
                  "Click to the button below to setup this experience in the Immersion Mobile app."
                  :
                  "You are going to control this experience from your phone, so let’s make sure you have the Immersion app installed and ready to go."
                }
              </p>
              {isMobile ?
                <p></p>
                :
                <p className="main-description-2">
                  To make this easy, we will email you a magic link to load the app and setup this experience. Click below to continue.
                </p>
              }
              <Grid container direction="row" className="download-app" alignItems="center">
                <Button variant="contained" id='button' color="primary" onClick={() => skip !== true ? emailMe() : isMobile ? emailMe() : setShowModalemail(true)} className="email-btn" >
                  {isMobile ?
                    'LAUNCH MOBILE APP'
                    :
                    'Send Me the Magic Link'}
                </Button>
              </Grid>
              {isMobile ?
                <p className="link" onClick={stayHideLink}>&dbquo;I installed the app, but don&apos;t see what to do next...&dbquo;</p>
                :
                <p className="link" onClick={stayHideLink}>I WOULD LIKE TO STAY ANONYMOUS</p>
              }
              {!isMobile &&
              <>
                <p className="install-main-description">
                  If you already have the app on your phone, you can also just enter this Experience ID#:
                </p>
                <h2 className="install-session-code">
                  {session_code.toUpperCase()}
                </h2>
              </>
              }
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
        <Dialog
          fullWidth={true}
          maxWidth={'md'}
          open={showModal}
          className="QR-participant-model"
          onClose={closeQRModal}
        >
          <DialogTitle>
            <IconButton aria-label="close" className="closeButton" onClick={closeQRModal}>
              <img src={'/assets/images/close-icon.svg'} alt={'img'} />
            </IconButton>
          </DialogTitle>
          <div className="QR-participant-model-wrapper">
            {isMobile ?
              <>
                <h3 className="text-center heading-text">
                  Once the App is Installed...
                </h3>
                <p className="QR-main-description">
                  Click to the button that looks like:
                </p>
                <Button className="QR-model-button" type="button" variant="contained" color="primary" > Add Experience by ID# </Button>
              </>
              :
              <div className="QrcodeGroup">
                <div className="codeBox">
                  <div className="QA-box"><QRCode size="240" value={QRlinkdata} /></div>
                  <div className="store-logo"><img src="/assets/images/apple-store.png"></img></div>
                </div>
                <div className="codeBox">
                  <div className="QA-box"><QRCode size="240" value={QRlinkdata} /></div>
                  <div className="store-logo"><img src="/assets/images/play-store.png"></img></div>
                </div>
              </div>
            }
            <div className="content-box">
              <div className="Cbox">
                {isMobile ?
                  <p className="QR-main-description">
                    And type in this code:
                  </p>
                  :
                  <p className="QR-main-description">
                    Use your phone to scan the code above and install the Immersion Mobile app. To stay anonymous, login as a Guest. <br /><br />Once the app is installed and you’ve connected a smartwatch, click the “Add Experience by ID” or “+” button, enter the code below, and join the experience from the app:
                  </p>
                }
              </div>
              <div className="Cbox">
                <h2 className="participant-code">{session_code.toUpperCase()}</h2>
              </div>
            </div>
          </div>
        </Dialog>
        <Dialog
          fullWidth={true}
          maxWidth={'sm'}
          open={showModalemail}
          className="modal-custom participateInstallModal"
          scroll="body"
        >
          <IconButton aria-label="close" className="closeButton" onClick={() => setShowModalemail(false)}>
            <img src={'/assets/images/close-icon.svg'} alt={'img'} />
          </IconButton>
          <div>
            <p className="email-modal-text">All we need is your email address, and we’ll get you that link right away.</p>
            <TextField
              value={sendLinkEmail}
              fullWidth
              margin="normal"
              id="email"
              label="Email Address*"
              name="email"
              onChange={(e) => handleChangeEmail(e)}
              autoFocus={sendLinkEmail ? false : true}
            />
            <Grid container
                  direction="row"
                  justifyContent="flex-end"
                  alignItems="flex-end"
            >
              <Button
                onClick={emailMe}
                disabled={validEmail ? false : true}
                color="primary"
              >
                send email
              </Button>
              <Button
                onClick={() => setShowModalemail(false)}
              >
                Cancel
              </Button>
              &nbsp;&nbsp;&nbsp;
            </Grid>
          </div>
        </Dialog>
        {loading &&
        <div className="loader">
          <Backdrop open={loading} ><CircularProgress color="inherit" /></Backdrop>
        </div>
        }
        <CustomSnackBar type={snackAlertType} message={snackAlertMsg} open={isShownSnackAlert} onClose={hideSnackAlert} />
      </SessionDetails>
    </>
  );
};

export default Install;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const session_code = query.session_code;
  let pid, searchemail, skip, link, deeplinkB, linkwebtoken, data, configdata, surveyLink = null;
  if (query && query.pid) {
    pid = query.pid;
  }
  if (query && query.email) {
    searchemail = query.pid;
  }
  if (query && query.skip) {
    skip = query.skip;
  }
  if (query && query.link) {
    link = query.link;
  }
  if (query && query.deeplinkB) {
    deeplinkB = query.deeplinkB;
  }
  if (query && query.webtoken) {
    linkwebtoken = query.webtoken;
  }
  if (query && query.data) {
    data = query.data;
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
        siteName,
        searchemail,
        skip,
        link,
        deeplinkB,
        linkwebtoken,
        data,
        configdata,
        surveyLink
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
        siteName,
        searchemail,
        skip,
        link,
        deeplinkB,
        linkwebtoken,
        data,
        configdata,
        surveyLink
      }))
    }
  }
};