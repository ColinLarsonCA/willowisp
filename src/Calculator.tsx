import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { calculateYearsToCoast, calculateInvestmentGrowth, InvestmentGrowth, pct, YearsToCoast, calculatePassiveIncome, PassiveIncome } from "./math";
import GrowthGraph from "./graphs/GrowthGraph";
import { parseAndShortHandDollars } from "./formatting";
import { useLocalStorage } from "./hooks/useLocalStorage";
import CoastGraph from "./graphs/CoastGraph";
import PassiveIncomeGraph from "./graphs/PassiveIncomeGraph";
import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import LearnMoreDialog from "./LearnMoreDialog";

const useStyles = makeStyles((theme) => ({
  wider: {
    maxWidth: "300px",
    width: "100%",
  },
  separator: {
    height: theme.spacing(2),
  },
  summaryContainer: {
    width: "100%",
  },
  resultsDivider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  resultsContainer: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  disclaimerContainer: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  disclaimerContent: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  informationSubtitle: {
    color: theme.palette.text.secondary,
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
  inputs: Inputs;
  anyNaNs: boolean;
  isRetirementPossibleByTargetAge: boolean;
  requiredPortfolio: number;
  yearsToRetirement: number;
  possibleRetirementAge: number;
  retirementAgeDifference: number;
  percentOfRetirementPortfolio: number;
  investmentGrowth: InvestmentGrowth[];
  yearsToCoast: YearsToCoast[];
  passiveIncome: PassiveIncome[];
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
    if (!props.encodedInputData) {
      localStorage.setItem(cacheKey, JSON.stringify(inputs));
    }
  }, [inputs]);
  const [currentAlert, setCurrentAlert] = useState<CurrentAlert>({
    open: false,
  });
  const showTips = false;
  const convertedInputs = useMemo(() => {
    const v: Inputs = {
      currentAge: parseInt(inputs.currentAge || "0"),
      retirementAge: parseInt(inputs.retirementAge || "0"),
      currentPortfolio: parseFloat(inputs.currentPortfolio || "0.00"),
      annualPortfolioContribution: parseFloat(
        inputs.annualPortfolioContribution || "0.00"
      ),
      annualRetirementExpenses: parseFloat(
        inputs.annualRetirementExpenses || "0.00"
      ),
      annualReturnRate: parseFloat(inputs.annualReturnRate || "0.00"),
      annualWithdrawalRate: parseFloat(inputs.annualWithdrawalRate || "0.00"),
    };
    return v;
  }, [inputs]);
  const results: Calculations = useMemo(() => {
    const v = convertedInputs;
    const requiredPortfolio =
      v.annualRetirementExpenses / pct(v.annualWithdrawalRate);
    const lnReturnRate = Math.log(1 + pct(v.annualReturnRate));
    const firstNumerator =
      v.annualPortfolioContribution + requiredPortfolio * lnReturnRate;
    const firstDenominator =
      v.annualPortfolioContribution + v.currentPortfolio * lnReturnRate;
    const secondNumerator = Math.log(firstNumerator / firstDenominator);
    let yearsToRetirement = secondNumerator / lnReturnRate;
    if (yearsToRetirement < 0) {
      yearsToRetirement = 0;
    }
    const possibleRetirementAge = Math.ceil(v.currentAge + yearsToRetirement);
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
    const investmentGrowth = calculateInvestmentGrowth(
      v.currentAge,
      Math.min(v.retirementAge, 100),
      v.currentPortfolio,
      v.annualPortfolioContribution,
      v.annualReturnRate
    )
    const yearsToCoast = calculateYearsToCoast(investmentGrowth, requiredPortfolio, v.annualReturnRate);
    const passiveIncome = calculatePassiveIncome(investmentGrowth, v.annualWithdrawalRate);
    const calculatedResults: Calculations = {
      inputs: v,
      anyNaNs,
      isRetirementPossibleByTargetAge,
      requiredPortfolio,
      yearsToRetirement,
      possibleRetirementAge,
      retirementAgeDifference,
      percentOfRetirementPortfolio,
      investmentGrowth,
      yearsToCoast,
      passiveIncome
    };
    return calculatedResults;
  }, [convertedInputs]);
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
  const [yourInformationExpanded, setYourInformationExpanded] = useLocalStorage("your_information_expanded", false);
  const [growthGraphAgeRange, setGrowthGraphAgeRange] = useState([0, 0]);
  useEffect(() => {
    setGrowthGraphAgeRange([results.inputs.currentAge, results.inputs.retirementAge]);
  }, [results.inputs.currentAge, results.inputs.retirementAge]);
  const [explanation, setExplanation] = useState("");
  return (
    <Box>
      <Accordion expanded={yourInformationExpanded} onChange={(_, expanded) => setYourInformationExpanded(expanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid container spacing={1}>
            <Grid item>
              <Typography>Your information</Typography>
            </Grid>
            <Grid item>
              <Typography className={classes.informationSubtitle}>
                {inputs.currentAge}→{inputs.retirementAge} —{" "}
                {parseAndShortHandDollars(inputs.currentPortfolio)}+
                <span style={{ textDecoration: "overline" }}>
                  {parseAndShortHandDollars(inputs.annualPortfolioContribution)}
                </span>{" "}
                compounding at {inputs.annualReturnRate || "0.00"}% and
                withdrawn at {inputs.annualWithdrawalRate || "0.00"}%
              </Typography>
            </Grid>
          </Grid>
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
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Learn about selecting a retirement age">
                        <IconButton onClick={() => setExplanation("Based on the financials and rates entered we will suggest a potential age when you could retire, as well as forecast the growth of your investments vs your retirement needs to help you plan for the future.")}>
                          <EmojiObjectsIcon/>
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
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
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Learn about investment portfolios">
                        <IconButton onClick={() => setExplanation("Your investment portfolio is the total dollar value of all of your invested money, including: stocks, bonds, mutual funds, ETFs, etc. Assets like houses, rental properties, and vehicles should not be included, however you should consider mortgages, rent, car payments, etc when calculating your expenses in retirement.")}>
                          <EmojiObjectsIcon/>
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
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
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Learn about real returns">
                        <IconButton onClick={() => setExplanation("Real returns are what are earned on an investment after accounting for taxes and inflation. Depending on your portfolio allocation, risk tolerance, and many other factors this will vary. Over a long period of time this will typically average out to 3-7% annually.")}>
                          <EmojiObjectsIcon/>
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
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
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Learn about withdrawal rates">
                        <IconButton onClick={() => setExplanation("Your withdrawal rate is what percentage of your portfolio you plan to withdraw annually in retirement to meet your expenses. Typically between 2-4% is chosen as a safe withdrawal rate.")}>
                          <EmojiObjectsIcon/>
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
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

      <div className={classes.resultsContainer}>
        {results.anyNaNs && (
          <Typography>
            Looks like there were some problems calculating, check for any
            errors in the information you provided
          </Typography>
        )}
        {!results.anyNaNs && (
          <div className={classes.summaryContainer}>
            <Chip
              icon={<FileCopyIcon />}
              label="Share these results"
              clickable
              color="primary"
              onClick={copyLink}
            />

            <Divider className={classes.resultsDivider} />
            <Typography variant="h6">
              {results.isRetirementPossibleByTargetAge
                ? `Congratulations, you're on track to retire by ${inputs.retirementAge}! 🎉`
                : `Uh oh, it doesn't look like you're going to reach your retirement goal. You'll have to find ways to save more or adjust your expectations to meet it.`}
            </Typography>
            <br />
            <Typography>
              {`It looks like you'll be able to retire by ${Math.ceil(
                results.possibleRetirementAge
              )}, that's ${Math.floor(
                Math.abs(results.retirementAgeDifference)
              )} years ${
                results.retirementAgeDifference < 0 ? "before" : "after"
              } you planned to.`}
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

            <Divider className={classes.resultsDivider} />
            <Typography variant="h6">
              Portfolio growth
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Based on the information provided this is how your portfolio is expected to grow over time
            </Typography>
            <div style={{ height: 500 }}>
              <GrowthGraph
                investmentGrowth={results.investmentGrowth}
                requiredPortfolio={results.requiredPortfolio}
              />
            </div>

            <Divider className={classes.resultsDivider} />
            <Typography variant="h6">
              Passive income growth
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Over time the annual passive income from your portfolio will grow. This is how it will compare to your expected expenses in retirement, so that you can decide when the right time to retire is.
            </Typography>
            <div style={{ height: 500 }}>
              <PassiveIncomeGraph passiveIncome={results.passiveIncome} annualRetirementExpenses={results.inputs.annualRetirementExpenses} />
            </div>

            <Divider className={classes.resultsDivider} />
            <Typography variant="h6">
              Coasting potential
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              If you wanted to take a lower stress job or one that required less of your time, but paid less so that you could not contribute to your portfolio anymore, this is how your retirement age could be affected
            </Typography>
            <div style={{ height: 500 }}>
              <CoastGraph possibleRetirementAge={results.possibleRetirementAge} targetRetirementAge={results.inputs.retirementAge} yearsToCoast={results.yearsToCoast} />
            </div>
          </div>
        )}
      </div>
      <div className={classes.disclaimerContainer}>
        <Card>
          <CardContent className={classes.disclaimerContent}>
            <Typography>
              {"The Will-o'-Wisp Retirement Forecaster (and "}<Link href="https://willowisp.ca">willowisp.ca</Link>{") is written and maintained by a Canadian software developer and casual investor to aid in his own retirement planning. It is highly recommended that you seek advice from a fiduciary financial advisor when planning for your own retirement."}
            </Typography>
            <br/><br/>
            <Typography>
              None of the information you enter on this website is saved to an external database, it is only saved locally within your web browser for ease of use.
            </Typography>
          </CardContent>
        </Card>
      </div>
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
      <LearnMoreDialog open={!!explanation} onClose={() => setExplanation("")} explanation={explanation} />
    </Box>
  );
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
