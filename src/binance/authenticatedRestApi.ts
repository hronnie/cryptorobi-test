import {FUTURES_PRICE_PRECISION_MAPPING, ORDER_TYPE_LIMIT} from "../core/constants";
import {toFixed} from "../core/utility";

require('dotenv').config();

const NodeBinanceApi = require('node-binance-api');


const apiKey = process.env.API_KEY;
const secretKey = process.env.API_SECRET;


const binanceNodeClient = new NodeBinanceApi().options({
    APIKEY: apiKey,
    APISECRET: secretKey
});

export async function buyFutureLimit(symbol: string,
                                amount: number,
                                limitPrice: number
                         ) {
    const precisionModel = FUTURES_PRICE_PRECISION_MAPPING.get(symbol);
    const quantity = amount / limitPrice;
    return await binanceNodeClient.futuresBuy(symbol, toFixed(quantity, precisionModel.quantityPrecision), toFixed(limitPrice, precisionModel.pricePrecision) );
}

export async function checkOrderStatus(symbol: string,
                                       orderId: string) {
    // return await client.getOrder(symbol, orderId);

}

