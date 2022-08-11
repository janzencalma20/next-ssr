import React, {useCallback, useEffect, useState} from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Button, Grid, Backdrop, CircularProgress, Typography, Modal, Fade, Box } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import axios from "axios";
import { isMobile, isAndroid, isIOS } from "react-device-detect";
import {GetServerSideProps} from "next";
import store from "../../store/store";
import {client} from "../../ApolloProvider";
import Config from '../../config/config';
import {CheckSessionValid} from "../../store/actions";
import SessionDetails from "components/session/SessionDetails";
import Head from "next/head";
import {useRouter} from "next/router";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backDrop: { backgroundColor: "rgba(0, 0, 0, 0.7)" },
}));

const createDynamicLinkBranchIO = async (params: any) => {
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
        "$devicetype": params.devicetype,
        "$sessiontype": params.sessiontype,
        "$email": params.email,
        "$pid": params.pid,
        "$env": Config.env,
        "$desktop_url": Config.CUSTOMER_URL + "deeplink/"
      },
    };
    axios.post(Config.branchio_url, dynamicLinkObj).then((result) => {
      resolve(result.data.url)
    }).catch((error) => {
      console.log("error ", error);
    })
  });
};

interface IProps {
  session_code: string,
  session_title: string,
  description: string,
  image: string,
  siteName: string
}

const ParticipantFlow = (props: IProps) => {
  const { session_code, session_title, description, image, siteName } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const router = useRouter();
  const apolloClient = useSelector((state: any) => state.apolloClient);
  const { userInfo, sessionDetails, is_loaded } = useSelector((state: any) => state.authUser);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const [backgroundImg, setbackgroundImg] = useState('/assets/images/participant-background.png');
  const [showQRModal, setShowQRModal] = useState(false);
  const QRCode = require('qrcode.react');
  const [QRlinkdata, setQRlinkdata] = useState('');
  const [topSelectOpen, setTopSelectOpen] = React.useState(false);
  const [bottomSelectOpen, setBottomSelectOpen] = React.useState(false);
  const [topButtonText, setTopButtonText] = useState("Let's Go!");
  const [bottomButtonText, setBottomButtonText] = useState("Connect My Device");
  const [departmentAlias, setDepartmentAlias] = useState('Your friend');

  useEffect(() => {
    if (is_loaded) {
      setLoading(false)
    }

    let status = sessionDetails ? sessionDetails.session_status : null;
    if (status == "COMPLETED" || status == "CANCELLED") {
      router.push({
        pathname: `/experience/completed/${session_code}`
      });
    }
    setTimeout(() => {
      const request1 = { session_code: session_code };
      dispatch(CheckSessionValid(apolloClient.client, request1));
    }, 60000);

    if (sessionDetails && sessionDetails.category_background_url) {
      setbackgroundImg(sessionDetails.category_background_url);
    }

    if (sessionDetails && sessionDetails.department_alias) {
      setDepartmentAlias(sessionDetails.department_alias);
    }

  }, [sessionDetails]);

  const makeid = (length: number) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const toggleTopSelect = () => {
    if (topSelectOpen) {
      setTopSelectOpen(false);
      setTopButtonText("Let's Go!");
    } else {
      setTopSelectOpen(true);
      setTopButtonText("Close");
    }
  };

  const toggelBottomSelect = () => {
    if (bottomSelectOpen) {
      setBottomSelectOpen(false);
      setBottomButtonText("Connect My Device");
    } else {
      setBottomSelectOpen(true);
      setBottomButtonText("Close");
    }
  };

  const initialCap = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const onSelectDevice = async (deviceType: string) => {

    //TODO:  this is a feature flag to prevent the automatic redirect
    // of fingerpulse users until the fingerpulse feature is live in
    // the mobile apps.
    // this should be removed when imm-4353 is pushed live.
    if (deviceType == "no_device") {
      onSelectNoDevice();
    } else {
      // create deeplink with device type

      //console.log("deviceType ", deviceType);
      let wt: any = makeid(8);
      let obj = {
        sessioncode: session_code,
        webtoken: wt,
        sessiontype: "MODERATED",
        devicetype: deviceType,
        fingerpulse: deviceType == "no_device" ? true : false,
        channel: sessionDetails.owner_company,
        stage: sessionDetails.session_status,
        campaign: session_code
      };
      let linkDatabranch: any = await createDynamicLinkBranchIO(obj);
      if (isMobile) {
        window.location.href = linkDatabranch
      } else {
        toggelBottomSelect();
        toggleTopSelect();
        // open dialog
        setQRlinkdata(linkDatabranch);
        // setShowQRModal(true)
        setOpen(true);
        // history.push(`/install/${session_code}`, { link: 'typeB', skip: true, deeplinkB: linkDatabranch, webtoken: wt });
      }
    }
  };

  const onSelectNoDevice = useCallback(() => {
    router.push({
      pathname: `/participants/nodevice/${session_code}`
    });
  }, [session_code]);

  const closeQRModal = () => {
    setShowQRModal(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const headerDivStyle = {
    backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url('${backgroundImg}')`,
    backgroundPosition: '0px 0px, 0px 0px',
    backgroundSize: 'auto, cover',
    backgroundRepeat: 'repeat, no-repeat',
  };

  const hidden = {
    display: 'none',
  };

  const shown = {
    display: 'block',
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
        {loading ?
          <div className="loader">
            <Backdrop open={loading} ><CircularProgress color="inherit" /></Backdrop>
          </div>
          :
          <>
            <div className="horzrule"></div>
            <div id="headersection" className="section wf-section headsect" style={headerDivStyle}>
              <div className="container-2 w-container"><img src={!!sessionDetails && !!sessionDetails.owner_profile_pic ? sessionDetails.owner_profile_pic : "/assets/images/profile.png"} loading="lazy" alt="" className="image"/><img src={!!sessionDetails && !!sessionDetails.owner_company_logo ? sessionDetails.owner_company_logo : "/assets/images/profile.png"} loading="lazy" alt="" className="image-2"/></div>
              <div className="container-3 w-container">
                <h2 className="invite-text">{!!sessionDetails && initialCap(sessionDetails.owner_first_name) + ' ' + initialCap(sessionDetails.owner_last_name)} invites you to</h2>
                <h1 className="heading-3">Join Something New & Fun</h1>


                <p className="paragraph">{departmentAlias} wants your help making {sessionDetails && sessionDetails.sharing_info && sessionDetails.sharing_info} even better with a new type of feedback that measures what your brain loves just by using a smartwatch.
                  Participation can be entirely anonymous & only takes a few minutes to set up.</p>
                <div className="selectpopup" style={!!topSelectOpen ? shown : hidden}>
                  <div className="div-block-2">
                    <h3 className="heading-6">Awesome!<br/>Select the watch you are wearing:</h3>
                  </div>
                  <div className="div-block-4">
                    {!isAndroid &&
                    <div className="div-block-3 watchselectdiv" onClick={() => onSelectDevice('AW')}><img src="/assets/images/apple-watch.jpg" loading="lazy" alt="" className="image-5"/>
                      <p className="selectlabel">Apple Watch</p>
                    </div>
                    }
                    <div className="div-block-3 watchselectdiv" onClick={() => onSelectDevice('WHOOP')}><img src="/assets/images/watch-2.svg" loading="lazy" alt="" className="image-5"/>
                      <p className="selectlabel">Whoop</p>
                    </div>
                    {!isIOS &&
                    <div className="div-block-3 watchselectdiv" onClick={() => onSelectDevice('WE')}><img src="/assets/images/watch-3.svg" loading="lazy" alt="" className="image-5"/>
                      <p className="selectlabel">Google Watch</p>
                    </div>
                    }
                    <div className="div-block-3 watchselectdiv" onClick={() => onSelectDevice('BLE')}><img src="/assets/images/Image-17.svg" loading="lazy" alt="" className="image-5"/>
                      <p className="selectlabel">Bluetooth Fitness</p>
                    </div>
                    <div className="div-block-3 watchselectdiv" onClick={() => onSelectDevice('no_device')}><img src="/assets/images/sad-face.png" loading="lazy" sizes="50px" srcSet="/assets/images/sad-face.png 500w, /assets/images/sad-face.png 512w" alt="" className="image-5"/>
                      <p className="selectlabel">I don&#x27;t have a watch</p>
                    </div>
                  </div>
                </div>
                <a href="#" id="topSelectButton" onClick={() => toggleTopSelect()} className="button-2 w-button">{topButtonText}</a>
              </div>
            </div>

            <div className="section-2 wf-section">
              <div className="container w-container">
                <h4 className="heading">Measure my brain? How does this work?</h4>
                <img src="/assets/images/arrow.png" width="40" loading="lazy" alt="" className=""/>
              </div>
            </div>

            <div className="wf-section">
              <div className="container-4 w-container">
                <h1 className="heading-4">Ever wonder what happens when you experience something cool?</h1>
                <div className="columns w-row">
                  <div className="w-col w-col-4">
                    <div className="div-block">
                      <div className="imgholder"><img src="/assets/images/brain-heart.svg" loading="lazy" alt="" className="image-3"/></div>
                      <h3 className="heading-5">Turns out your brain and heart are connected</h3>
                      <p className="explaintext">By listening to your heart, we can learn what your brain loves.</p>
                    </div>
                  </div>
                  <div className="w-col w-col-4">
                    <div className="div-block">
                      <div className="imgholder"><img src="/assets/images/smartwatch.svg" loading="lazy" alt="" className="image-4"/></div>
                      <h3 className="heading-5">We use your smartwatch to listen to your heart</h3>
                      <p className="explaintext">Download and link the apps to your watch and phone, then watch the video. It just takes a few minutes.</p>
                    </div>
                  </div>
                  <div className="w-col w-col-4">
                    <div className="div-block">
                      <div className="imgholder"><img src="/assets/images/stats.svg" loading="lazy" alt=""/></div>
                      <h3 className="heading-5">We’ll show you the results in real-time</h3>
                      <p className="explaintext">Learn what turns your brain on and see how you compare to others.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="section-3 wf-section">
              <div className="container-5 w-container">
                <div className="selectpopup selectbottom" style={!!bottomSelectOpen ? shown : hidden}>
                  <div className="div-block-2">
                    <h3 className="heading-6">Awesome!<br/>Select the watch you are wearing:</h3>
                  </div>
                  <div className="div-block-4">
                    {!isAndroid &&
                    <div className="div-block-3 watchselectdiv" onClick={() => onSelectDevice('AW')}><img src="/assets/images/apple-watch.jpg" loading="lazy" alt="Apple Watch" className="image-5"/>
                      <p className="selectlabel">Apple Watch</p>
                    </div>
                    }
                    <div className="div-block-3 watchselectdiv" onClick={() => onSelectDevice('WHOOP')}><img src="/assets/images/watch-2.svg" loading="lazy" alt="Whoop" className="image-5"/>
                      <p className="selectlabel">Whoop</p>
                    </div>
                    {!isIOS &&
                    <div className="div-block-3 watchselectdiv" onClick={() => onSelectDevice('WE')}><img src="/assets/images/watch-3.svg" loading="lazy" alt="Google Watch" className="image-5"/>
                      <p className="selectlabel">Google Watch</p>
                    </div>
                    }
                    <div className="div-block-3 watchselectdiv" onClick={() => onSelectDevice('BLE')}><img src="/assets/images/Image-17.svg" loading="lazy" alt="Bluetooth Fitness Sensor" className="image-5"/>
                      <p className="selectlabel">Bluetooth Fitness</p>
                    </div>
                    <div className="div-block-3 watchselectdiv" onClick={() => onSelectDevice('no_device')}><img src="/assets/images/sad-face.png" loading="lazy" sizes="50px" srcSet="/assets/images/sad-face.png 500w, /assets/images/sad-face.png 512w" alt="No Device" className="image-5"/>
                      <p className="selectlabel">I don&#x27;t have a watch</p>
                    </div>
                  </div>
                </div>
                <a href="#" id="bottomSelectButton" onClick={() => toggelBottomSelect()} className="button-3 w-button">{bottomButtonText}</a>
              </div>
            </div>

            <Modal
              aria-labelledby="transition-modal-title"
              aria-describedby="transition-modal-description"
              className={classes.modal}
              open={open}
              onClose={handleClose}
              closeAfterTransition
              BackdropComponent={Backdrop}
              BackdropProps={{
                classes: {
                  root: classes.backDrop
                },
                timeout: 500,
              }}
            >
              <Fade in={open}>
                <div className="modal-view">
                  <Grid container justifyContent="center" direction="row" spacing={3}>
                    <Grid item xs={6} sm={6}>
                      <Box textAlign="center" className='qrcode'>
                        <QRCode size="270" value={QRlinkdata} />

                        <Button href="#text-buttons" color="primary"><img src="/assets/images/apple-btn.svg" width="245" height="74" alt="Apple Store" /></Button>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <Box textAlign="center" className='qrcode'>
                        <QRCode size="270" value={QRlinkdata} />

                        <Button href="#text-buttons" color="primary"><img src="/assets/images/google-store.svg" width="243" height="74" alt="Apple Store" /></Button>
                      </Box>
                    </Grid>
                  </Grid>
                  <Typography variant="body1">Use your phone to scan the code above and install / open the Immersion Mobile app. Once installed, you may also click the “+” button and enter this code:</Typography>
                  <Typography component="div" className="pro-name">{session_code.toUpperCase()}</Typography>
                </div>
              </Fade>
            </Modal>
          </>
        }
      </SessionDetails>
    </>
  )
};

export default ParticipantFlow;

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