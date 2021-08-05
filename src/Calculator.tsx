import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FileCopyIcon from "@material-ui/icons/FileCopy";

const useStyles = makeStyles((theme) => ({
  wider: {
    width: "300px",
  },
  separator: {
    height: theme.spacing(2),
  },
  summaryContainer: {
    width: "100%",
  },
  summaryDivider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

interface RawFormInputs {
  currentAge: string;
  retirementAge: string;
  currentPortfolio: string;
  annualPortfolioContribution: string;
  annualRetirementExpenses: string;
  annualReturnRate: string;
  annualWithdrawalRate: string;
}

interface Inputs {
  currentAge: number;
  retirementAge: number;
  currentPortfolio: number;
  annualPortfolioContribution: number;
  annualRetirementExpenses: number;
  annualReturnRate: number;
  annualWithdrawalRate: number;
}

interface Calculations {
  anyNaNs: boolean;
  isRetirementPossibleByTargetAge: boolean;
  requiredPortfolio: number;
  yearsToRetirement: number;
  possibleRetirementAge: number;
  retirementAgeDifference: number;
  percentOfRetirementPortfolio: number;
}

export interface CalculatorProps {
  encodedInputData?: string;
}

interface CurrentAlert {
  open: boolean;
  message?: string;
  severity?: "success" | "info" | "warning" | "error";
}

const cacheKey = "retirement_forecasting_inputs";

export default function Calculator(props: CalculatorProps) {
  const classes = useStyles();
  const defaultFormInputs: RawFormInputs = {
    currentAge: "21",
    retirementAge: "65",
    currentPortfolio: "0.00",
    annualPortfolioContribution: "12000.00",
    annualRetirementExpenses: "30000.00",
    annualReturnRate: "4.00",
    annualWithdrawalRate: "3.50",
  };
  const [inputs, setInputs] = useState(() => {
    const encodedInputData = props.encodedInputData;
    const cachedInputData = localStorage.getItem(cacheKey);
    if (encodedInputData) {
      try {
        const jsonInputData = atob(encodedInputData);
        return JSON.parse(jsonInputData) as RawFormInputs;
      } catch (e) {
        console.error("something went wrong while decoding: " + e);
      }
    } else if (cachedInputData) {
      return JSON.parse(cachedInputData) as RawFormInputs;
    }
    return defaultFormInputs;
  });
  useEffect(() => {
    localStorage.setItem(cacheKey, JSON.stringify(inputs));
  }, [inputs]);
  const [currentAlert, setCurrentAlert] = useState<CurrentAlert>({
    open: false,
  });
  const showTips = false;
  const results: Calculations = useMemo(() => {
    const v: Inputs = {
      currentAge: parseInt(inputs.currentAge || "0"), //C2
      retirementAge: parseInt(inputs.retirementAge || "0"), //C8
      currentPortfolio: parseFloat(inputs.currentPortfolio || "0.00"), //C3
      annualPortfolioContribution: parseFloat(
        inputs.annualPortfolioContribution || "0.00"
      ), //C4
      annualRetirementExpenses: parseFloat(
        inputs.annualRetirementExpenses || "0.00"
      ), //C6
      annualReturnRate: parseFloat(inputs.annualReturnRate || "0.00"), //C5
      annualWithdrawalRate: parseFloat(inputs.annualWithdrawalRate || "0.00"), //C7
    };
    const requiredPortfolio =
      v.annualRetirementExpenses / (v.annualWithdrawalRate / 100.0);
    const lnReturnRate = Math.log(1 + v.annualReturnRate / 100.0);
    const firstNumerator =
      v.annualPortfolioContribution + requiredPortfolio * lnReturnRate;
    const firstDenominator =
      v.annualPortfolioContribution + v.currentPortfolio * lnReturnRate;
    const secondNumerator = Math.log(firstNumerator / firstDenominator);
    let yearsToRetirement = secondNumerator / lnReturnRate;
    if (yearsToRetirement < 0) {
      yearsToRetirement = 0;
    }
    const possibleRetirementAge = v.currentAge + yearsToRetirement;
    const isRetirementPossibleByTargetAge =
      possibleRetirementAge <= v.retirementAge;
    const retirementAgeDifference = possibleRetirementAge - v.retirementAge;
    const percentOfRetirementPortfolio =
      (v.currentPortfolio / requiredPortfolio) * 100.0;
    const anyNaNs =
      isNaN(requiredPortfolio) ||
      isNaN(yearsToRetirement) ||
      isNaN(possibleRetirementAge) ||
      isNaN(retirementAgeDifference) ||
      isNaN(percentOfRetirementPortfolio);
    const calculatedResults: Calculations = {
      anyNaNs,
      isRetirementPossibleByTargetAge,
      requiredPortfolio,
      yearsToRetirement,
      possibleRetirementAge,
      retirementAgeDifference,
      percentOfRetirementPortfolio,
    };
    return calculatedResults;
  }, [inputs]);
  const dollars = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const copyLink = useCallback(() => {
    const encoded = btoa(JSON.stringify(inputs));
    const url = `${window.location.href}?data=${encoded}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCurrentAlert({
          open: true,
          message: "Link copied to clipboard!",
          severity: "success",
        });
      })
      .catch(() => {
        setCurrentAlert({
          open: true,
          message: "Failed to copy link to clipboard",
          severity: "error",
        });
      });
  }, [inputs]);
  return (
    <Box>
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Your information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container justifyContent={"flex-start"} spacing={1}>
            <Grid item xs={12}>
              <Typography>Ages</Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                className={classes.wider}
                label={"Current age"}
                placeholder={"0"}
                value={inputs.currentAge}
                onChange={(event) => {
                  setInputs({ ...inputs, currentAge: event.target.value });
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                className={classes.wider}
                label={"Age you would like to retire by"}
                placeholder={"0"}
                helperText={
                  showTips
                    ? "Your actual retirement may be sooner or later based on your financials"
                    : ""
                }
                value={inputs.retirementAge}
                onChange={(event) => {
                  setInputs({ ...inputs, retirementAge: event.target.value });
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <div className={classes.separator} />
            </Grid>

            <Grid item xs={12}>
              <Typography>Financials</Typography>
              <Typography variant={"caption"}>
                The model accounts for typical inflation rates - so values
                should be entered as snapshots of the current year or the first
                year of retirement
              </Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                className={classes.wider}
                label={"Current value of portfolio"}
                placeholder={"0.00"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                helperText={
                  showTips
                    ? "Including stocks, bonds, mutual funds, ETFs, etc. Not including investment properties."
                    : ""
                }
                value={inputs.currentPortfolio}
                onChange={(event) => {
                  setInputs({
                    ...inputs,
                    currentPortfolio: event.target.value,
                  });
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                className={classes.wider}
                label={"Annual contribution to portfolio"}
                placeholder={"0.00"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                helperText={
                  showTips
                    ? "How much you could save each year assuming your income and expenses were static"
                    : ""
                }
                value={inputs.annualPortfolioContribution}
                onChange={(event) => {
                  setInputs({
                    ...inputs,
                    annualPortfolioContribution: event.target.value,
                  });
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                className={classes.wider}
                label={"Annual expenses in retirement"}
                placeholder={"0.00"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                helperText={
                  showTips
                    ? "How much you expect to spend per year in retirement assuming your expenses were static"
                    : ""
                }
                value={inputs.annualRetirementExpenses}
                onChange={(event) => {
                  setInputs({
                    ...inputs,
                    annualRetirementExpenses: event.target.value,
                  });
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <div className={classes.separator} />
            </Grid>

            <Grid item xs={12}>
              <Typography>Rates</Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                className={classes.wider}
                label={"Annual real return of portfolio"}
                placeholder={"0.00"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">%</InputAdornment>
                  ),
                }}
                helperText={
                  showTips
                    ? "This will vary but over a long period of time it will typically average 4-7%"
                    : ""
                }
                value={inputs.annualReturnRate}
                onChange={(event) => {
                  setInputs({
                    ...inputs,
                    annualReturnRate: event.target.value,
                  });
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                className={classes.wider}
                label={"Annual withdrawal rate in retirement"}
                placeholder={"0.00"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">%</InputAdornment>
                  ),
                }}
                helperText={
                  showTips
                    ? "Percentage of the portfolio that will be withdrawn to meet your retirement expenses, typically 3-4%"
                    : ""
                }
                value={inputs.annualWithdrawalRate}
                onChange={(event) => {
                  setInputs({
                    ...inputs,
                    annualWithdrawalRate: event.target.value,
                  });
                }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Summary</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {results.anyNaNs && (
            <Typography>
              Looks like there were some problems calculating, check for any
              errors in the information you provided
            </Typography>
          )}
          {!results.anyNaNs && (
            <div className={classes.summaryContainer}>
              <IconButton onClick={copyLink}>
                <FileCopyIcon />
              </IconButton>
              Copy a link
              <Divider className={classes.summaryDivider} />
              <Typography>
                {results.isRetirementPossibleByTargetAge
                  ? `Congratulations, you're on track to retire by ${inputs.retirementAge}! 🎉`
                  : `Uh oh, it doesn't look like you're going to reach your retirement goal. You'll have to find ways to save more or adjust your expectations to meet it.`}
              </Typography>
              <Typography>
                {`It looks like you'll be able to retire by ${Math.ceil(
                  results.possibleRetirementAge
                )}, that's ${Math.floor(
                  Math.abs(results.retirementAgeDifference)
                )} years before you planned to.`}
              </Typography>
              <Typography>
                {`Based on your retirement needs, you'll need to save at least ${dollars.format(
                  results.requiredPortfolio
                )}.`}
              </Typography>
              <Typography>
                {`So far you've saved ${results.percentOfRetirementPortfolio.toFixed(
                  2
                )}% of what you need to retire. Keep it up!`}
              </Typography>
            </div>
          )}
        </AccordionDetails>
      </Accordion>
      <Snackbar
        open={currentAlert.open}
        autoHideDuration={6000}
        onClose={() => setCurrentAlert({ open: false })}
      >
        <Alert
          severity={currentAlert.severity}
          onClose={() => setCurrentAlert({ open: false })}
        >
          {currentAlert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
