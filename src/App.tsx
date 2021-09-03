import React, { useEffect, useState } from "react";
import Header from "./Header";
import Calculator from "./Calculator";
import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Card,
  CardContent,
  createTheme,
  CssBaseline,
  Grid,
  Link,
  ThemeProvider,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { cyan } from "@material-ui/core/colors";
import { deepOrange } from "@material-ui/core/colors";
import { Router, navigate } from "@reach/router";
import ShowChartIcon from "@material-ui/icons/ShowChart";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import Budget from "./Budget";

interface Path {
  to: string;
  label: string;
  icon: React.ReactNode;
  title: string;
}
const paths: Path[] = [
  {
    to: "/retirement",
    label: "Retirement",
    icon: ShowChartIcon,
    title: "Retirement Forecasting",
  },
  {
    to: "/budget",
    label: "Budget",
    icon: AccountBalanceIcon,
    title: "Budgeting",
  },
];

const useStyles = makeStyles((theme) => ({
  content: {
    margin: "auto",
    maxWidth: "916px",
    paddingTop: theme.spacing(2),
  },
  offset: theme.mixins.toolbar,
  disclaimerContainer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
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
        paper: "#353535",
      },
    },
  });
  useEffect(() => localStorage.setItem("theme", theme), [theme]);
  const [path, setPath] = useState(paths[0]);
  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <div>
        <CssBaseline />
        <Header toggleTheme={toggleTheme} theme={theme} title={path.title} />
        <div className={classes.offset} />
        <Box className={classes.content}>
          <Router>
            <Calculator path="/" encodedInputData={dataParam || undefined} />
            <Calculator
              path="/retirement"
              encodedInputData={dataParam || undefined}
            />
            <Budget path="/budget" />
          </Router>
          <div className={classes.disclaimerContainer}>
            <Card>
              <CardContent>
                <Grid container spacing={2} direction="column">
                  <Grid item>
                    <Typography>
                      {"Will-o'-Wisp ("}
                      <Link href="https://willowisp.ca">willowisp.ca</Link>
                      {
                        ") is written and maintained by a Canadian software developer and casual investor to aid in his own financial planning. It is highly recommended that you seek advice from a fiduciary financial advisor for your own financial planning."
                      }
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography>
                      None of the information you enter on this website is saved
                      to an external database, it is only saved locally within
                      your web browser for ease of use.
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </div>
        </Box>
        <div className={classes.offset} />
        <AppBar
          position="fixed"
          color="primary"
          style={{ top: "auto", bottom: 0 }}
        >
          <BottomNavigation
            value={paths.findIndex((p) => p.to === path.to)}
            onChange={(event, newValue) => {
              navigate(newValue < paths.length ? paths[newValue].to : "/");
              setPath(paths[newValue]);
            }}
            showLabels
          >
            <BottomNavigationAction
              label="Retirement"
              icon={<ShowChartIcon />}
            />
            <BottomNavigationAction
              label="Budget"
              icon={<AccountBalanceIcon />}
            />
          </BottomNavigation>
        </AppBar>
      </div>
    </ThemeProvider>
  );
}
