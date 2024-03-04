export type RawAverageRate = {
    loan_type: {
        loan_id: 'ten_year_fix' | 'twenty_year_fix' | 'thirty_year_fix' | 'seven_one_arm' | 'five_one_arm' | 'thirty_year_va' | 'thirty_year_fha';
        term: number;
        is_va_loan: boolean | null
        is_fixed: boolean;
        display_name: string;
    }
    rate: number;
};
export type RawMortgageRate = {
    data: {
        loan_analysis: {
            market: {
                mortgage_data: {
                    average_rate: RawAverageRate[]
                }
            }
        }
    }
}

export type MortgageAverage = {
    loanType: string;
    rate: number;
}
