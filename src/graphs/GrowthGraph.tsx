import React from "react";
import { InvestmentGrowth } from "../math";
import { formatDollars, shortHandDollars } from "../formatting";
import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@material-ui/core/styles";
import { allMargins, graphMargin, useGraphTheme } from "./graphs";

interface GrowthGraphProps {
  investmentGrowth: InvestmentGrowth[];
  requiredPortfolio: number;
}

export default function GrowthGraph(props: GrowthGraphProps) {
  const datums = props.investmentGrowth.map((growth) => {
    return { x: growth.age, y: growth.value };
  });
  const theme = useTheme();
  return (
    <ResponsiveLine
      data={[{ id: "investment-growth", data: datums }]}
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
          return shortHandDollars(parseFloat(value), 1);
        },
        legend: "Portfolio",
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
          value: props.requiredPortfolio,
          lineStyle: { stroke: "#61CDBB", strokeWidth: 2 },
          legend: `${formatDollars(props.requiredPortfolio, 2)}`,
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

