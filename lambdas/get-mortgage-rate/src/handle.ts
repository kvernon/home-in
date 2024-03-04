/* global fetch */

import {APIGatewayProxyResult, Context, Handler} from 'aws-lambda';
import {NotFoundHttpStatusError, StatusCodes} from '@cubedelement.com/civil-web';
import * as process from "node:process";
import {MortgageAverage, RawMortgageRate} from "./raw-mortgage-rate";

/**
 * goal is to return an average rate
 * @param event
 * @param context
 */
export const handler: Handler = async (event: {
    headers: Record<string, string>
    queryStringParameters?: { zipCode: string, termYear?: number }
}, context: Context): Promise<APIGatewayProxyResult> => {
    console.log('event', event);

    const rapidApiKey = process.env.RAPID_API_KEY ?? null;
    const rapidApiSecret = process.env.RAPID_API_SECRET ?? null;
    const ceApiKey = process.env.API_KEY ?? null;

    if (!rapidApiKey || !rapidApiSecret || !ceApiKey) {
        return {
            statusCode: StatusCodes.variantAlsoNegotiates,
            body: JSON.stringify({
                message: 'Variant Also Negotiates: internal configuration error'
            })
        }
    }

    console.log('ceApiKey', ceApiKey);
    if (event.headers['x-api-key'] !== ceApiKey) {
        return {
            statusCode: StatusCodes.unauthorized,
            body: JSON.stringify({
                message: 'Unauthorized'
            })
        }
    }

    if (!event || !event.queryStringParameters?.zipCode) {
        return {
            statusCode: StatusCodes.badRequest,
            body: JSON.stringify({
                message: 'Bad Request: zipCode not supplied'
            })
        }
    }

    try {
        const init = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Proxy-Secret': rapidApiSecret,
                'X-RapidAPI-Host': 'realty-in-us.p.rapidapi.com'
            }
        };

        const res = await fetch(`https://realty-in-us.p.rapidapi.com/mortgage/v2/check-rates?postal_code=${event.queryStringParameters?.zipCode}`, init);

        const response = (await res.json()) as RawMortgageRate;

        const result: MortgageAverage = {loanType: '', rate: 0};

        console.log('response', response);
        if (!response?.loan_analysis?.market?.mortgage_data?.average_rate?.length) {
            return {
                statusCode: StatusCodes.notFound,
                body: JSON.stringify(new NotFoundHttpStatusError('Not Found'))
            };
        }

        const filtered = response.loan_analysis.market.mortgage_data.average_rate
            .filter(x => !x.loan_type.is_va_loan &&
                x.loan_type.is_fixed &&
                x.loan_type.term === event.queryStringParameters?.termYear || 30)

        console.log('filtered', filtered);
        const summed = filtered
            .reduce((previousValue, currentValue) => {
                previousValue.rate += currentValue.rate;
                return previousValue;
            }, {rate: 0, loan_type: {is_va_loan: false, term: 0, is_fixed: false}});

        result.rate = summed.rate / response.loan_analysis.market.mortgage_data.average_rate.length;
        result.loanType = filtered[0].loan_type.display_name;

        return {
            statusCode: res.status,
            body: JSON.stringify(result)
        };
    } catch (e) {
        console.log(e);
        return {
            statusCode: 500,
            body: JSON.stringify({message: (e as Error).message})
        }
    }
};
