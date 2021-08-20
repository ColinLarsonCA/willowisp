import React from "react";
import { PassiveIncome } from "../math";
import { formatDollars, shortHandDollars } from "../formatting";
import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@material-ui/core/styles";
import { allMargins, useGraphTheme } from "./graphs";

interface PassiveIncomeGraphProps {
  passiveIncome: PassiveIncome[];
  annualRetirementExpenses: number;
  minAge: number;
  maxAge: number;
}

export default function PassiveIncomeGraph(props: PassiveIncomeGraphProps) {
  const datums = props.passiveIncome.
    filter((income) => income.atAge >= props.minAge && income.atAge <= props.maxAge).
    map((income) => {
      return { x: income.atAge, y: income.income };
    }
  );
  const theme = useTheme();
  return (
    <ResponsiveLine
      data={[{ id: "passive-income", data: datums }]}
      margin={allMargins}
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
      theme={useGraphTheme()}
    />
  );
}

