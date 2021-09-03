import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { RouteComponentProps } from "@reach/router";
import { useLocalStorage } from "./hooks/useLocalStorage";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const useStyles = makeStyles((theme) => ({}));

export interface BudgetProps {}

const cacheKey = "budget_inputs";

export default function Budget(props: BudgetProps & RouteComponentProps) {
  const classes = useStyles();
  const [budgetInformationExpanded, setBudgetInformationExpanded] =
    useLocalStorage("budget_information_expanded", false);
  return (
    <Box>
      <Accordion
        expanded={budgetInformationExpanded}
        onChange={(_, expanded) => setBudgetInformationExpanded(expanded)}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid container spacing={1}>
            <Grid item>
              <Typography>Budget information</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container justifyContent={"flex-start"} spacing={2}></Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
