import React from "react";
import { InvestmentGrowth } from "./math";
import { formatDollars, shortHandDollars } from "./formatting";
import { ResponsiveLine } from "@nivo/line";

interface GrowthGraphProps {
  investmentGrowth: InvestmentGrowth[];
  requiredPortfolio: number;
}

export default function GrowthGraph(props: GrowthGraphProps) {
  const datums = props.investmentGrowth.map((growth) => {
    return { x: growth.age, y: growth.value };
  });
  const graphMargin = 60;
  return (
    <ResponsiveLine
      data={[{ id: "investment-growth", data: datums }]}
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
      axisLeft={{
        format: (value) => {
          return shortHandDollars(parseFloat(value), 1);
        },
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
        },
      ]}
    />
  );
}
