import {getChannelData} from "./dao/channel";
import {getFutureMarkPrice, getFuturesCoinExchangeInfo} from "./binance/publicRestApi";
import {ChannelInputModel} from "./model/channelInput.model";
import {buyFutureLimit, checkOrderStatus} from "./binance/authenticatedRestApi";

const { default: Binance } = require("binance-api-node");
const AsyncPolling = require('async-polling');

async function run() {

    let buy = true;
    let sell = false;
    let amountToCoin = 0;
    let buyOrderId: string = '';
    let sellOrderId = null;
    let actPrice = 0;
    const checkTime = 2000;

    AsyncPolling(async (end: any) => {
        const inputData: ChannelInputModel = await getChannelData();
        if (inputData.appStatus === 'STOP') {
            console.log('Application was stopped from outside');
            return;
        }

        const symbol = `${inputData.coinTo}${inputData.coinFrom}`;
        const actPriceResponse = await getFutureMarkPrice(symbol);
        const actPrice = actPriceResponse?.data?.markPrice;
        console.log('actPrice - starting cycle', actPrice);

        console.log('buy', buy);
        if (buy) {
            console.log('buyOrderId', buyOrderId);
            if (buyOrderId !== '') {
                const actBuyOrder:any = await checkOrderStatus(symbol, buyOrderId);
                console.log('actBuyOrder', actBuyOrder);
                if (actBuyOrder.status === 'FILLED') {
                    buy = false;
                    sell = true;
                    buyOrderId = '';
                }
            } else {
                const buyOrderResult: any = await buyFutureLimit(symbol, inputData.amountFromCoin, inputData.bottomPrice);
                console.log('buyOrderResult', buyOrderResult);
                buyOrderId = buyOrderResult.orderId;
            }
        }
        console.log(actPrice);
        end();
    }, checkTime).run();



}

run();
