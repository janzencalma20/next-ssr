import React from "react";
import { Grid, Container, Box, makeStyles, Button } from "@material-ui/core";
import { useSelector } from 'react-redux';
import SessionDetails from "components/session/SessionDetails";
import {GetServerSideProps} from "next";
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
}));

interface IProps {
  session_code: string,
  session_title: string,
  description: string,
  image: string,
  siteName: string
}

const CompletedExperience = (props: IProps) => {
  const { session_code, session_title, description, image, siteName } = props;
  const successImg = "/assets/images/undraw_finish.png";
  const classes = useStyles();
  const { sessionDetails } = useSelector((state: any) => state.authUser);

  const loginUrl = () => {
    window.location.replace(`/${sessionDetails && sessionDetails.session_code ? sessionDetails.session_code : ''}`)
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

      <Container component="main" className={classes.layout}>
        <Box className="">
          <span className="logo-container">
            <img src="/assets/images/black-logo.png" alt="Logo" />
          </span>
          <SessionDetails session_code={session_code} >
            <h3 className="text-center text-dark-black">{"If we’re being honest, you’re a bit of an overachiever :)"}</h3>
            <h1 className="text-center text-dark-black">{"You already completed this experience"}</h1>
            <h3 className="text-center text-dark-black">{`EXPERIENCE NAME  (ID#: ${sessionDetails && sessionDetails.session_code ? sessionDetails.session_code : ''})`}</h3>
            <h3 className="text-center text-dark-black">{`Invited by ${sessionDetails && sessionDetails.owner_first_name ? sessionDetails.owner_first_name : ''} from ${sessionDetails && sessionDetails.owner_company ? sessionDetails.owner_company : ''}`}</h3>
            <Grid container direction="row" justify="center" alignItems="center">
              <img src={successImg} width="60%" />
            </Grid>
            <p className="main-description mt-20">
              {"If you’re looking for a different experience, check your email, log in below,"}
              <p className="">{"or use the chatbot below to get in touch with our team who can help."}
              </p>            </p>
            <Grid container className="mt-20 mb-20" direction="row" justify="center" alignItems="center">
              <Button className="next-btn" variant="contained" color="primary" size="medium" onClick={loginUrl}>Log In</Button>
            </Grid>
          </SessionDetails >
        </Box>
      </Container>
    </>
  );
};

export default CompletedExperience;

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
