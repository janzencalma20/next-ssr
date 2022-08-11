import SessionDetails from "components/session/SessionDetails";
import {Grid, Button, makeStyles} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import { GetServerSideProps } from "next";
import EventHeading from "components/EventHeading";
import store from "../../../../store/store";
import {CheckSessionValid} from "../../../../store/actions";
import {client} from "../../../../ApolloProvider";
import Head from "next/head";

const useStyles = makeStyles(() => ({
  layout: {
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: "0",
    paddingRight: "0",
    display: "flex",
    justifyContent: "center",
    alignItems: "top",
    Height: "100%",
  },
  learnMoreBtn: {
    width: 348,
    height: 48,
    fontSize: 20,
    fontWeight: "normal",
    textTransform: "capitalize",
    '@media (max-width: 767px)': {
      width: 'auto',
      fontSize: 17
    }
  }
}));

interface IProps {
  session_code: string,
  identifier: string,
  session_title: string,
  description: string,
  image: string,
  siteName: string
}

const ExperienceCompleted = (props: IProps) => {
  const { session_code, session_title, description, image, siteName } = props;
  const classes = useStyles();
  const { sessionDetails } = useSelector((state: any) => state.authUser);
  const [backgroundImg, setBackgroundImg] = useState('/assets/images/completedsession.png');

  useEffect(() => {
    document.body.style.backgroundColor = ""
  });

  useEffect(() => {
    if (sessionDetails && sessionDetails.category_background_url) {
      setBackgroundImg(sessionDetails.category_background_url);
    }
  }, [sessionDetails]);

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
        <div className="exp-no-avl-container">
          <EventHeading backgroundImg={backgroundImg}>
            <div className="groupBox">
              <h3 className="heading-text">
                Blimey!
              </h3>
              <h5 className="main-description"> {`${sessionDetails && sessionDetails.owner_first_name ? sessionDetails.owner_first_name : ''} from ${sessionDetails && sessionDetails.owner_company ? sessionDetails.owner_company : ''} invited you to an experience called: ${sessionDetails && sessionDetails.session_title ? sessionDetails.session_title : ''}.`}</h5>
              <p className="main-description mt-20"></p>
              <Grid container direction="row" alignItems="center">
                <h5 className="main-description">
                  {`${sessionDetails && sessionDetails.owner_first_name ? sessionDetails.owner_first_name : ''} set this experience to expire recently, so it’s no longer available for new viewers.
                  `}</h5>
                <h5 className="main-description">
                  Thanks for taking the time and jumping in to participate!
                </h5>
              </Grid>
              <div className="">
                <Button variant="contained" color="primary" size="large" className={classes.learnMoreBtn} onClick={() => window.location.replace('https://www.getimmersion.com')
                } > Learn More About Immersion </Button>
              </div>
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

export default ExperienceCompleted;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const session_code = query.session_code;
  let identifier = null;
  if (query && query.identifier) {
    identifier = query.identifier;
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