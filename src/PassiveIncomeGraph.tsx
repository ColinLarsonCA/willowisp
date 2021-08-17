import React from "react";
import { PassiveIncome } from "./math";
import { formatDollars, shortHandDollars } from "./formatting";
import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@material-ui/core/styles";
import { graphMargin } from "./graphs";

interface PassiveIncomeGraphProps {
    passiveIncome: PassiveIncome[];
    annualRetirementExpenses: number;
}

export default function PassiveIncomeGraph(props: PassiveIncomeGraphProps) {
  const datums = props.passiveIncome.map((income) => {
    return { x: income.atAge, y: income.income };
  });
  const theme = useTheme();
  return (
    <ResponsiveLine
      data={[{ id: "passive-income", data: datums }]}
      margin={{
        top: graphMargin,
        right: graphMargin,
        bottom: graphMargin,
        left: graphMargin,
      }}
      xScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yFormat={(datumValue) => {
        const value = datumValue.valueOf();
        if (typeof value === "string") {
          return shortHandDollars(parseFloat(value), 2);
        }
        return shortHandDollars(value, 2);
      }}
      axisBottom={{
        legend: "Age",
        legendPosition: "middle",
        legendOffset: 40,
      }}
      axisLeft={{
        format: (value) => {
          return shortHandDollars(parseFloat(value));
        },
        legend: "Annual passive income",
        legendPosition: "middle",
        legendOffset: -52,
      }}
      gridXValues={[]}
      pointSize={10}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      markers={[
        {
          axis: "y",
          value: props.annualRetirementExpenses,
          lineStyle: { stroke: "#61CDBB", strokeWidth: 2 },
          legend: `${formatDollars(props.annualRetirementExpenses, 2)}`,
          legendOrientation: "horizontal",
          textStyle: {
            fill: theme.palette.text.primary,
          },
        },
      ]}
      theme={{
        background: theme.palette.background.default,
        textColor: theme.palette.text.primary,
        crosshair: {
          line: { stroke: theme.palette.text.primary },
        },
        axis: { 
          ticks: { text: { fill: theme.palette.text.primary } },
        },
        labels: {
          text: { fill: theme.palette.text.primary }
        },
        markers: {
          text: { fill: theme.palette.text.primary }
        },
        tooltip: {
          container: { background: theme.palette.background.paper }
        },
        legends: {
          text: { fill: theme.palette.text.primary }
        }
      }}
    />
  );
}

