import React from 'react';
import { InvestmentGrowth } from './math';
import { ResponsiveLine } from '@nivo/line'

interface GrowthGraphProps {
    investmentGrowth: InvestmentGrowth[];
}

export default function GrowthGraph(props: GrowthGraphProps) {
  const datums = props.investmentGrowth.map(growth => {
    return {x: growth.age, y: growth.value}
  })
  return (
    <ResponsiveLine
      data={[{id: 'investment-growth', data: datums}]}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: 'point' }}
      yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false }}
      yFormat=" >-.2f"
      gridXValues={[ 0, 2000, 4000, 6000, 8000 ]}
      pointSize={10}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      useMesh={true}
    />
  )
}
