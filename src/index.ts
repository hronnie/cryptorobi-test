import {getChannelData, logFutureOrderData} from "./dao/realTimeDbDAO";
import {getFutureMarkPrice, getFuturesCoinExchangeInfo} from "./binance/publicRestApi";
import {ChannelInputModel} from "./model/channelInput.model";
import {buyFutureLimit, checkOrderStatus} from "./binance/authenticatedRestApi";
import {FuturesOrderModel} from "./model/futuresOrder.model";

const { default: Binance } = require("binance-api-node");
const AsyncPolling = require('async-polling');

async function test() {
    const model = new FuturesOrderModel(
        {
            orderId: 36717463665,
            symbol: 'BTCUSDT',
            status: 'FILLED',
            clientOrderId: 'IsDKlxKNiOcYjZh8lD5Ulc',
            price: '55050',
            avgPrice: '0.00000',
            origQty: '0.001',
            executedQty: '0',
            cumQuote: '0',
            timeInForce: 'GTX',
            type: 'LIMIT',
            reduceOnly: false,
            closePosition: false,
            side: 'BUY',
            positionSide: 'BOTH',
            stopPrice: '0',
            workingType: 'CONTRACT_PRICE',
            priceProtect: false,
            origType: 'LIMIT',
            time: 1616517408281,
            updateTime: 1616517408281 }
    );

    logFutureOrderData(model);

}

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


        // ******************************************
        // *********** BUY SIDE *********************
        // ******************************************
        console.log('buy', buy);
        if (buy) {
            console.log('buyOrderId', buyOrderId);
            if (buyOrderId !== '') {
                const actBuyOrderRaw: any = await checkOrderStatus(symbol, buyOrderId);
                const actBuyOrder: FuturesOrderModel = new FuturesOrderModel(actBuyOrderRaw);
                console.log('actBuyOrder', actBuyOrder);
                if (actBuyOrder.status === 'FILLED') {
                    logFutureOrderData(actBuyOrder);
                    buy = false;
                    sell = true;
                    buyOrderId = '';
                } else if (actBuyOrder.status === 'EXPIRED') {
                    logFutureOrderData(actBuyOrder);
                    console.log('Application was stopped due to lower price to bottom price');
                    return;
                }
            } else {
                const buyOrderRaw: FuturesOrderModel = await buyFutureLimit(symbol, inputData.amountFromCoin, inputData.bottomPrice);
                const buyOrderResult: FuturesOrderModel = new FuturesOrderModel(buyOrderRaw);
                logFutureOrderData(buyOrderResult);
                console.log('buyOrderResult', buyOrderResult);
                buyOrderId = buyOrderResult.orderId.toString();
            }
        }
        console.log('Current price: ', actPrice);
        end();
    }, checkTime).run();



}

run();
// test();
