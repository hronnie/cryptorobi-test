import {getChannelData, logFutureOrderData} from "./dao/realTimeDbDAO";
import {getFutureMarkPrice, getFuturesCoinExchangeInfo} from "./binance/publicRestApi";
import {ChannelInputModel} from "./model/channelInput.model";
import {
    buyFutureLimit, cancelFuturesOrder,
    checkOrderStatus,
    getFuturePosition, sellFuturesStopLossLimit,
    sellFuturesTakeProfitLimit
} from "./binance/authenticatedRestApi";
import {FuturesOrderModel} from "./model/futuresOrder.model";
import {cancelFuturesOrderIfActive, extractMarketFromPosition} from "./core/utility";
import {STOP_LIMIT_SHIFT} from "./core/constants";
import {sendEmail} from "./service/emailSend";

const { default: Binance } = require("binance-api-node");
const AsyncPolling = require('async-polling');

async function test() {
    sendEmail("this is a test email");
    console.log('email was sent hopefully');
}


async function run() {

    let buy = true;
    let sell = false;
    let buyOrderId: string = '';
    let sellTpOrderId: string = '';
    let sellSLOrderId: string = '';
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
            if (buyOrderId === '') {
                const buyOrderRaw: FuturesOrderModel =
                    await buyFutureLimit(symbol, inputData.amountFromCoin, inputData.bottomPrice);
                const buyOrderResult: FuturesOrderModel = new FuturesOrderModel(buyOrderRaw);
                logFutureOrderData(buyOrderResult);
                console.log('buyOrderResult', buyOrderResult);
                buyOrderId = buyOrderResult.orderId.toString();
            } else {
                const actBuyOrderRaw: any = await checkOrderStatus(symbol, buyOrderId);
                const actBuyOrder: FuturesOrderModel = new FuturesOrderModel(actBuyOrderRaw);
                console.log('actBuyOrder', actBuyOrder);
                if (actBuyOrder.status === 'FILLED') {
                    logFutureOrderData(actBuyOrder);


                    // Buy order is filled, let's set take profit and stop loss orders:
                    const positions = await getFuturePosition();
                    const currentPosition =  extractMarketFromPosition(symbol, positions);
                    console.log(currentPosition);

                    const stopLossNumPrice: number = inputData.bottomPrice - (Math.ceil(inputData.bottomPrice * (inputData.stopLossRatio / 100)));

                    const stopOrderRaw = await sellFuturesStopLossLimit(symbol, currentPosition.positionAmt, stopLossNumPrice, stopLossNumPrice + STOP_LIMIT_SHIFT.get(symbol));
                    const takeOrderRaw = await sellFuturesTakeProfitLimit(symbol, currentPosition.positionAmt, inputData.topPrice + STOP_LIMIT_SHIFT.get(symbol), inputData.topPrice);
                    const stopOrder: FuturesOrderModel = new FuturesOrderModel(stopOrderRaw);
                    const takeOrder: FuturesOrderModel = new FuturesOrderModel(takeOrderRaw);
                    sellSLOrderId = stopOrder.orderId.toString();
                    sellTpOrderId = takeOrder.orderId.toString();

                    logFutureOrderData(stopOrder);
                    logFutureOrderData(takeOrder);

                    console.log('stopOrder', stopOrder);
                    console.log('takeOrder', takeOrder);
                    // end


                    buy = false;
                    sell = true;
                } else if (actBuyOrder.status === 'EXPIRED') {
                    logFutureOrderData(actBuyOrder);
                    console.log('Application was stopped due to lower price to bottom price');
                    return; // EXIT
                    // send email
                }
            }
        }

        // ******************************************
        // *********** SELL SIDE *********************
        // ******************************************

        if (sell) {
            const actTPSellOrderRaw: any = await checkOrderStatus(symbol, sellTpOrderId);
            const actTPSellOrder: FuturesOrderModel = new FuturesOrderModel(actTPSellOrderRaw);
            const actSLSellOrderRaw: any = await checkOrderStatus(symbol, sellSLOrderId);
            const actSLSellOrder: FuturesOrderModel = new FuturesOrderModel(actSLSellOrderRaw);

            console.log('actSLSellOrder', actSLSellOrder);
            if (actTPSellOrder.status === 'FILLED') {
                console.log('actTPSellOrder', actTPSellOrder);
                cancelFuturesOrderIfActive(symbol, sellSLOrderId);
                // send email
                buy = true;
                sell = false;
            }
            if (actSLSellOrder.status === 'FILLED') {
                console.log('actTPSellOrder', actTPSellOrder);
                cancelFuturesOrderIfActive(symbol, sellTpOrderId);
                // send email
                return; // EXIT
            }
        }

        console.log('Current price: ', actPrice);
        end();


        // IF (sell)
        // IF (sellOrderId)
        // order = get order by sellOrderId
        // IF (order.pending)
        // CONTINUE
        // END IF
        // ELSE
        // buy = true
        // sell = false
        // sellOrderId = NULL
        // END ELSE
        // END IF
        // ELSE
        //     [sellOrderId, orderDetails, newAmountFromCoin, amountFromCoin] = sell(coinFrom, coinTo, amountToCoin, reinvest)
        // END ELSE
        // END IF
    }, checkTime).run();



}

// run();
test();
