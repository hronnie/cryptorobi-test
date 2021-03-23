import {FUTURES_API_MARK_PRICE_PATH, FUTURES_API_URL} from "../core/constants";

require('dotenv').config();
const axios = require('axios');
const { default: Binance } = require("binance-api-node");

const apiKey = process.env.API_KEY;
const secretKey = process.env.API_SECRET;

const client = Binance({ apiKey, secretKey });

export async function getFutureMarkPrice(symbol: string) {
    return axios.get(`${FUTURES_API_URL}${FUTURES_API_MARK_PRICE_PATH}?symbol=${symbol}`);
}

export async function getFuturesCoinExchangeInfo() {
    return await client.futuresExchangeInfo();
}
