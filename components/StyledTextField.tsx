import React from "react";
import { TextField, withStyles } from "@material-ui/core";

const StyledTextField = withStyles({
  root: {
    fontSize: 24,
    "& label": {
      font: 'normal normal bold 20px/24px Roboto',
      color: '#fff'
    },
    "& input": {
      font: 'normal normal bold 20px/24px Roboto',
      color: '#fff',
      borderBottom: "2px solid #fff",
    },
    "& .MuiInput-underline:before": {
      borderBottomColor: "#fff",
      borderBottomWidth: 2,
    },
    "& .MuiInputBase-root.Mui-disabled:before": {
      borderBottom: "2px solid #697683",
    },
    "& .MuiFormLabel-asterisk.MuiInputLabel-asterisk": {
      color: "red"
    }
  },
})(TextField);

export default StyledTextField;