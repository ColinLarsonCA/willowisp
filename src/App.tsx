import React from "react";
import Header from "./Header";
import Calculator from "./Calculator";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  content: {
    margin: "auto",
    maxWidth: "916px",
    paddingTop: theme.spacing(2),
  },
}));

export default function App() {
  const classes = useStyles();
  return (
    <div>
      <Header />
      <Box className={classes.content}>
        <Calculator />
      </Box>
    </div>
  );
}
