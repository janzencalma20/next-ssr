import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { makeStyles, Theme } from '@material-ui/core/styles';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const useStyles = makeStyles((theme: Theme) => ({
  snackroot: {
    bottom: 0
  },
  alertroot: {
    borderRadius: '12px 12px 0px 0px',
    padding: 20
  }
}));

type PropsFunction = (event?: React.SyntheticEvent, reason?: string) => void
export default function CustomizedSnackbars({ open, type, message, onClose, customColor }: { open: boolean, type: any, message: string, onClose: PropsFunction, customColor?: string }) {
  const classes = useStyles();
  return (
    <Snackbar open={open} autoHideDuration={3000} classes={{ root: classes.snackroot }} onClose={onClose}>
      <Alert onClose={onClose} severity={type} style={customColor ? { backgroundColor: customColor } : {}} classes={{ root: classes.alertroot }}>{message}</Alert>
    </Snackbar>
  );
}
