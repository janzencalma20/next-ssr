import React, { forwardRef,useEffect } from 'react';
import PropTypes from 'prop-types';
import { Container, Box, makeStyles, } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  layout: {
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: "0",
    paddingRight: "0",
    display: "flex",
    justifyContent: "left",
    alignItems: "left",
    minHeight: `calc(100% - 50px)`,
  },
}));
const EventHeading = forwardRef(({ children, backgroundImg, ...rest }: any, ref) => {
  const classes = useStyles();

  useEffect(() => {
    document.body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65) ) , url(${backgroundImg})`;
  });

  return (
    <Container component="main" className={classes.layout} ref={ref} {...rest} >
      <Box className="main-div">
				<span className="logo-container">
					<img src="/assets/images/black-logo.png" alt="Logo" />
				</span>
        {children}
      </Box>
    </Container>
  );
});
EventHeading.propTypes = {
  children: PropTypes.node
};

EventHeading.displayName = 'EventHeading';

export default EventHeading;

