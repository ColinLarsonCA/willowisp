import React, { useEffect, useState } from "react";
import Header from "./Header";
import Calculator from "./Calculator";
import {
  Box,
  createTheme,
  CssBaseline,
  ThemeProvider,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { cyan } from "@material-ui/core/colors";
import { deepOrange } from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
  content: {
    margin: "auto",
    maxWidth: "916px",
    paddingTop: theme.spacing(2),
  },
  offset: theme.mixins.toolbar,
}));

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const dataParam = params.get("data");
  const classes = useStyles();
  const initialTheme = () =>
    localStorage.getItem("theme") === "light" ? "light" : "dark";
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme());
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
  const lightTheme = createTheme({
    palette: {
      type: "light",
      primary: cyan,
      secondary: deepOrange,
    },
  });
  const darkTheme = createTheme({
    palette: {
      type: "dark",
      primary: deepOrange,
      secondary: cyan,
      background: {
        default: "#101418",
        paper: "#101418",
      },
    },
  });
  useEffect(() => localStorage.setItem("theme", theme), [theme]);
  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <div>
        <CssBaseline />
        <Header toggleTheme={toggleTheme} theme={theme} />
        <div className={classes.offset} />
        <Box className={classes.content}>
          <Calculator encodedInputData={dataParam || undefined} />
        </Box>
      </div>
    </ThemeProvider>
  );
}
