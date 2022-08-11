import React from 'react';
import { Box, Button, Container, makeStyles } from '@material-ui/core';
import { Helmet } from 'react-helmet';
import MESSAGES from '../helper/message';
import Config from '../config/config';

const useStyles = makeStyles(() => ({
  root: {
    minHeight: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  image: {
    maxWidth: '100%',
    width: 560,
    maxHeight: 300,
    height: 'auto'
  },
  title: {
    paddingTop: "40px",
    font: 'normal normal bold 70px/88px Spartan-bold',
    color: '#fff',
    textAlign: 'left',
    opacity: 1,
    letterSpacing: '0px',
    '& br':{
      display:"none",
    },
    '@media (max-width: 720px)': {
      fontSize: 44,
      lineHeight: '40px'
    },
    '@media (max-width: 567px)': {
      '& br':{
        display:"block",
      },
    },
  },
  title1: {
    fontSize: 60,
    fontFamily: 'Spartan-bold',
    color: '#fff',
    textAlign: 'left',
    opacity: 1,
    letterSpacing: '0px',
    '@media (max-width: 720px)': {
      fontSize: 30,
    },
  },
  button: {
    width: 223,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#0179EE',
    textTransform: 'none',
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'roboto-regular',
    '&:hover': {
      backgroundColor: '#0f9fef'
    }
  }
}));

export default function Home() {
  const classes = useStyles();

  const redirectToHome = () => {
    window.location.replace(Config.CUSTOMER_URL);
  };

  return (
    <Container disableGutters={true} maxWidth={false}>
      <div className="page-not-found">
        <div className="bg-top" style={{ background: 'linear-gradient( rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65) ), url("/assets/images/errorpage.png")' }}>
          <Helmet title={MESSAGES.PAGE_TITLE.PageNotFound} />
          <div className="margin-left" >
            <div className={classes.title}>Oops!<br/> Brain Freeze!</div>
          </div>
          <div className="groupBox margin-left" >
            <Box display="flex" justifyContent="left">
              <div className="main-description">
                <div>
                  <p>Check the URL of the page you’re trying to access or just click the button below to return Home.</p>
                </div>
              </div>
            </Box>
            <Box display="flex" justifyContent="left">
              <Button type="button" className={classes.button} onClick={redirectToHome}>Return Home</Button>
            </Box>
            <Box display="flex" justifyContent="left">
              <div className="big-main-description">
                404
              </div>
            </Box>
            <Box><div className={classes.title1}>Page Not Found</div></Box>

          </div>
          <div className="bottom-image poweredimmersionLogo">
            <div className="txtImgBox">
              <h2 className="bottomText">Powered by</h2>
              <figure><img src="/assets/images/white-logo.png"></img></figure>
            </div>
            <span className="copyrighttext">(C) 2021 Immersion Neuroscience Inc. All rights reserved.</span>
          </div>
        </div>

      </div>
    </Container>
  );
}
