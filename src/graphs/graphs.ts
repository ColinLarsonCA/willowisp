import { useTheme } from "@material-ui/core";
import { Margin, Theme as GraphTheme } from "@nivo/core";
import { useMemo } from "react";

export const allMargins: Margin = {
  top: 30,
  right: 30,
  bottom: 60,
  left: 60,
};

export function useGraphTheme(): GraphTheme {
  const theme = useTheme();
  return useMemo(() => {
    return {
      background: theme.palette.background.default,
      textColor: theme.palette.text.primary,
      crosshair: {
        line: { stroke: theme.palette.text.primary },
      },
      axis: {
        ticks: { text: { fill: theme.palette.text.primary } },
      },
      labels: {
        text: { fill: theme.palette.text.primary },
      },
      markers: {
        text: { fill: theme.palette.text.primary },
      },
      tooltip: {
        container: { background: theme.palette.background.paper },
      },
      legends: {
        text: { fill: theme.palette.text.primary },
      },
    };
  }, [theme]);
}
