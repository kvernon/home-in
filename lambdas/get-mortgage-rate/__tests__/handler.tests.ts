import {handler} from "../src/handle";
import {Context} from "aws-lambda";
import {describe, test, expect, jest, afterEach, beforeEach, afterAll} from '@jest/globals';
import {MortgageAverage, RawMortgageRate} from "../src/raw-mortgage-rate";
import {StatusCodes} from "@cubedelement.com/civil-web";

describe('handler unit tests', () => {
    let fetchMocked = global.fetch = jest.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

    afterEach(() => {
        jest.resetAllMocks();

        delete process.env.RAPID_API_KEY;
        delete process.env.RAPID_API_SECRET;
        delete process.env.API_KEY;
    });

    describe('and success', () => {
        let response: jest.Mocked<Response>;

        afterAll(() => {
            fetchMocked = jest.fn();
        });

        beforeEach(() => {
            process.env.RAPID_API_KEY = 'RAPID_API_KEY';
            process.env.API_KEY = 'API_KEY';
            process.env.RAPID_API_SECRET = 'RAPID_API_SECRET';
        });

        describe('with data', () => {
            let rawData: RawMortgageRate = {
                data: {
                    loan_analysis: {
                        market: {
                            mortgage_data: {
                                average_rate: [{
                                    rate: 4,
                                    loan_type: {
                                        loan_id: "thirty_year_fix",
                                        term: 30,
                                        is_va_loan: false,
                                        is_fixed: true,
                                        display_name: "display_name"
                                    }
                                }, {
                                    rate: 4,
                                    loan_type: {
                                        loan_id: "thirty_year_fix",
                                        term: 30,
                                        is_va_loan: false,
                                        is_fixed: true,
                                        display_name: "display_name"
                                    }
                                }, {
                                    rate: 4,
                                    loan_type: {
                                        loan_id: "thirty_year_fha",
                                        term: 30,
                                        is_va_loan: false,
                                        is_fixed: false,
                                        display_name: "display_name"
                                    }
                                }, {
                                    rate: 4,
                                    loan_type: {
                                        loan_id: "five_one_arm",
                                        term: 5,
                                        is_va_loan: false,
                                        is_fixed: false,
                                        display_name: "display_name"
                                    }
                                }]
                            }
                        }
                    }
                }
            };

            beforeEach(() => {
                response = {
                    ok: true,
                    status: 200,
                    json: jest.fn<any>().mockResolvedValue(rawData)
                } as unknown as jest.Mocked<Response>;
            });

            test('should avg', async () => {
                fetchMocked.mockResolvedValue(response);

                const expected: MortgageAverage = {
                    loanType: 'display_name',
                    rate: 4
                };

                const zipCode = '77449';
                await expect(handler({
                    headers: {
                        'x-api-key': 'API_KEY'
                    },
                    queryStringParameters: {zipCode}
                }, {} as unknown as Context, () => {
                })).resolves.toEqual({statusCode: 200, body: JSON.stringify(expected)});
            });

            test('should call fetch with', async () => {
                fetchMocked.mockResolvedValue(response);

                const zipCode = '77449';
                const termYear = 30;
                await handler({
                    headers: {
                        'x-api-key': 'API_KEY'
                    },
                    queryStringParameters: {zipCode, termYear}
                }, {} as Context, () => {
                });

                expect(fetchMocked).toHaveBeenCalledWith(
                    `https://realty-in-us.p.rapidapi.com/mortgage/v2/check-rates?postal_code=${zipCode}`,
                    {
                        method: 'GET',
                        headers: {
                            'X-RapidAPI-Key': 'RAPID_API_KEY',
                            'X-RapidAPI-Proxy-Secret': 'RAPID_API_SECRET',
                            'X-RapidAPI-Host': 'realty-in-us.p.rapidapi.com'
                        }
                    });
            });
        });

        describe('with empty average_rate', () => {
            let rawData: RawMortgageRate = {
                data: {
                    loan_analysis: {
                        market: {
                            mortgage_data: {
                                average_rate: []
                            }
                        }
                    }
                }
            };

            beforeEach(() => {
                response = {
                    ok: true,
                    status: 200,
                    json: jest.fn<any>().mockResolvedValue(rawData)
                } as unknown as jest.Mocked<Response>;
            });

            test('should avg', async () => {
                fetchMocked.mockResolvedValue(response);

                const zipCode = '77449';
                await expect(handler({
                    headers: {
                        'x-api-key': 'API_KEY'
                    },
                    queryStringParameters: {zipCode}
                }, {} as unknown as Context, () => {
                })).resolves.toEqual({
                    statusCode: 404,
                    body: JSON.stringify({name: 'NotFoundHttpStatusError', statusCode: 404})
                });
            });
        });
    });

    describe('and failure', () => {
        describe('and not configured with 3rd party api key', () => {
            test('should 506', async () => {
                process.env.API_KEY = 'API_KEY';
                process.env.RAPID_API_SECRET = 'RAPID_API_SECRET';

                const result = await handler(null, {} as Context, () => {
                });

                expect(result).toEqual({
                    statusCode: 506,
                    body: JSON.stringify({
                        message: 'Variant Also Negotiates: internal configuration error'
                    })
                });

                expect(fetchMocked).not.toHaveBeenCalled();
            });
        });

        describe('and not configured with 3rd party secret', () => {
            test('should 506', async () => {
                process.env.RAPID_API_KEY = 'RAPID_API_KEY';
                process.env.API_KEY = 'API_KEY';

                const result = await handler(null, {} as Context, () => {
                });

                expect(result).toEqual({
                    statusCode: 506,
                    body: JSON.stringify({
                        message: 'Variant Also Negotiates: internal configuration error'
                    })
                });

                expect(fetchMocked).not.toHaveBeenCalled();
            });
        });

        describe('and not configured with our key', () => {
            test('should 506', async () => {
                process.env.RAPID_API_KEY = 'RAPID_API_KEY';
                process.env.RAPID_API_SECRET = 'RAPID_API_SECRET';

                const result = await handler(null, {} as Context, () => {
                });

                expect(result).toEqual({
                    statusCode: 506,
                    body: JSON.stringify({
                        message: 'Variant Also Negotiates: internal configuration error'
                    })
                });

                expect(fetchMocked).not.toHaveBeenCalled();
            });
        });

        describe('and zipCode not supplied', () => {
            test('should 400', async () => {
                process.env.RAPID_API_KEY = 'RAPID_API_KEY';
                process.env.API_KEY = 'API_KEY';
                process.env.RAPID_API_SECRET = 'RAPID_API_SECRET';

                const result = await handler({
                    headers: {
                        'x-api-key': 'API_KEY'
                    }
                }, {} as Context, () => {
                });

                expect(result).toEqual({
                    statusCode: 400,
                    body: JSON.stringify({
                        message: 'Bad Request: zipCode not supplied'
                    })
                });

                expect(fetchMocked).not.toHaveBeenCalled();
            });
        });

        describe('and api-key not supplied', () => {
            test('should 400', async () => {
                process.env.RAPID_API_KEY = 'RAPID_API_KEY';
                process.env.API_KEY = 'API_KEY';
                process.env.RAPID_API_SECRET = 'RAPID_API_SECRET';

                const result = await handler({
                    headers: {
                        get: jest.fn().mockReturnValueOnce('')
                    }
                }, {} as Context, () => {
                });

                expect(result).toEqual({
                    statusCode: StatusCodes.unauthorized,
                    body: JSON.stringify({
                        message: 'Unauthorized'
                    })
                });

                expect(fetchMocked).not.toHaveBeenCalled();
            });
        });

        describe('and api-key is incorrect supplied', () => {
            test('should 400', async () => {
                process.env.RAPID_API_KEY = 'RAPID_API_KEY';
                process.env.API_KEY = 'API_KEY';
                process.env.RAPID_API_SECRET = 'RAPID_API_SECRET';

                const result = await handler({
                    headers: {
                        get: jest.fn().mockReturnValueOnce('2')
                    }
                }, {} as Context, () => {
                });

                expect(result).toEqual({
                    statusCode: StatusCodes.unauthorized,
                    body: JSON.stringify({
                        message: 'Unauthorized'
                    })
                });

                expect(fetchMocked).not.toHaveBeenCalled();
            });
        });
    });
});
