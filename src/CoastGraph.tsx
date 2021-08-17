import React from "react";
import { YearsToCoast } from "./math";
import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@material-ui/core/styles";
import { graphMargin } from "./graphs";

interface CoastGraphProps {
  possibleRetirementAge: number;
  targetRetirementAge: number;
  yearsToCoast: YearsToCoast[];
}

export default function CoastGraph(props: CoastGraphProps) {
  console.log(props);
  const datums = props.yearsToCoast.map((year) => {
    return { x: year.atAge, y: year.years + props.possibleRetirementAge };
  });
  const theme = useTheme();
  return (
    <ResponsiveLine
      data={[{ id: "coast", data: datums }]}
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
      axisBottom={{
        legend: "Your age",
        legendPosition: "middle",
        legendOffset: 40,
      }}
      axisLeft={{
        legend: "Retirement age",
        legendPosition: "middle",
        legendOffset: -52,
      }}
      pointSize={10}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      markers={[
        {
          axis: "y",
          value: props.targetRetirementAge,
          lineStyle: { stroke: "#61CDBB", strokeWidth: 2 },
          legend: "Target retirement age: " + props.targetRetirementAge,
          legendOrientation: "horizontal",
          textStyle: {
            fill: theme.palette.text.primary
          }
        }
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

