export function pct(percent: number): number {
  return percent/100.0;
}

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

export interface YearsToCoast {
  atAge: number;
  years: number;
}

export function calculateYearsToCoast(investmentGrowth: InvestmentGrowth[], requiredPortfolio: number, realReturn: number): YearsToCoast[] {
  const yearsToCoast: YearsToCoast[] = [];
  investmentGrowth.forEach((year) => {
    const years = Math.max(Math.ceil(Math.log(requiredPortfolio/year.value)/Math.log(1+pct(realReturn))), 0);
    yearsToCoast.push({
      atAge: year.age,
      years: years
    })
  });
  return yearsToCoast;
}

