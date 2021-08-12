export interface InvestmentGrowth {
  age: number;
  value: number;
}

export function calculateInvestmentGrowth(fromAge: number, toAge: number, initialInvestment: number, annualInvestment: number, realReturn: number): InvestmentGrowth[] {
  let totalInvestment = initialInvestment;
  let investmentGrowth: InvestmentGrowth[] = [{age: fromAge, value: totalInvestment}];
  for (let i = fromAge+1; i <= toAge; i++) {
    let investmentReturn = (totalInvestment + annualInvestment/2)*pct(realReturn);
    let addedInvestment = annualInvestment + investmentReturn;
    totalInvestment += addedInvestment;
    investmentGrowth.push({age: i, value: totalInvestment});
  }
  return investmentGrowth;
}

export function pct(percent: number): number {
  return percent/100.0;
}