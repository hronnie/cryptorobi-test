import {getFutureCoinPrice, getFutureCoinQuantity, toFixed} from "../core/utility";
import {ORDER_TYPE_STOP_LOSS_LIMIT, ORDER_TYPE_TAKE_PROFIT_LIMIT} from "../core/constants";

require('dotenv').config();

const NodeBinanceApi = require('node-binance-api');


const apiKey = process.env.API_KEY;
const secretKey = process.env.API_SECRET;


const binanceNodeClient = new NodeBinanceApi().options({
    APIKEY: apiKey,
    APISECRET: secretKey
});

export async function buyFutureLimit(symbol: string,
                                usdtAmount: number,
                                limitPrice: number
                         ) {
    return await binanceNodeClient.futuresBuy(symbol, getFutureCoinQuantity(symbol, limitPrice, usdtAmount),  getFutureCoinPrice(symbol, limitPrice));
}

export async function sellFuturesTakeProfitLimit(symbol: string,
                                                 positionAmt: string,
                                                 price: number,
                                                 stopPrice: number) {
    return await binanceNodeClient.futuresOrder('SELL',
                                                    symbol,
                                                    positionAmt,
                                                    false,
                                                    {
                                                        type: ORDER_TYPE_TAKE_PROFIT_LIMIT,
                                                        stopPrice: getFutureCoinPrice(symbol, stopPrice),
                                                        price: getFutureCoinPrice(symbol, price),
                                                        quantity: positionAmt
                                                    });
}

export async function sellFuturesStopLossLimit(symbol: string,
                                                 positionAmt: string,
                                                 price: number,
                                                 stopPrice: number) {
    return await binanceNodeClient.futuresOrder( 'SELL',
                                                    symbol,
                                                    positionAmt,
                                                    false,
                                                    {
                                                        type: ORDER_TYPE_STOP_LOSS_LIMIT,
                                                        stopPrice: getFutureCoinPrice(symbol, stopPrice),
                                                        price: getFutureCoinPrice(symbol, price),
                                                        quantity: positionAmt
                                                    } );
}

export async function cancelFuturesOrder(symbol: string, orderId: string) {
    return await binanceNodeClient.futuresCancel(symbol, {orderId: orderId});
}

export async function checkOrderStatus(symbol: string,
                                       orderId: string) {
    return await binanceNodeClient.futuresOrderStatus(symbol,  {orderId });
}

export async function getFuturePosition() {
    return await binanceNodeClient.futuresPositionRisk();
}





