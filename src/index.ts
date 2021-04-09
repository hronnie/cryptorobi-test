import {getChannelData, logFutureOrderData} from "./dao/realTimeDbDAO";
import {getFutureMarkPrice, getFuturesCoinExchangeInfo} from "./binance/publicRestApi";
import {ChannelInputModel} from "./model/channelInput.model";
import {
    buyFutureLimit,
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
    const stopLossNumPrice: number = 57946 - (Math.ceil(57946 * (0.2 / 100)));
    console.log(stopLossNumPrice)

}


async function run() {

    sendEmail('################## Welcome to Crypto Robi ##################');

    let buy = true;
    let sell = false;
    let buyOrderId: string = '';
    let sellTpOrderId: string = '';
    let sellSLOrderId: string = '';
    const checkTime = 2000;

    AsyncPolling(async (end: any) => {
        const inputData: ChannelInputModel = await getChannelData();
        if (inputData.appStatus === 'STOP') {
            sendEmail('Application was stopped from outside');
            return;
        }

        const symbol = `${inputData.coinTo}${inputData.coinFrom}`;
        const actPriceResponse = await getFutureMarkPrice(symbol);
        const actPrice = actPriceResponse?.data?.markPrice;
        console.log('actPrice - starting cycle', actPrice);


        // ******************************************
        // *********** BUY SIDE *********************
        // ******************************************
        if (buy) {
            console.log('buyOrderId', buyOrderId);
            if (buyOrderId === '') {
                const buyOrderRaw: FuturesOrderModel =
                    await buyFutureLimit(symbol, inputData.amountFromCoin, inputData.bottomPrice);
                const buyOrderResult: FuturesOrderModel = new FuturesOrderModel(buyOrderRaw);
                buyOrderId = buyOrderResult.orderId.toString();
            } else {
                const actBuyOrderRaw: any = await checkOrderStatus(symbol, buyOrderId);
                const actBuyOrder: FuturesOrderModel = new FuturesOrderModel(actBuyOrderRaw);
                if (actBuyOrder.status === 'FILLED') {
                    console.log('actBuyOrder', actBuyOrder);
                    sendEmail('Vettem: ' + actBuyOrder.toOrderString());

                    // Buy order is filled, let's set take profit and stop loss orders:
                    const positions = await getFuturePosition();
                    const currentPosition =  extractMarketFromPosition(symbol, positions);

                    const stopLossNumPrice: number = inputData.bottomPrice - (Math.ceil(inputData.bottomPrice * (inputData.stopLossRatio / 100)));

                    const takeOrderRaw = await sellFuturesTakeProfitLimit(symbol, currentPosition.positionAmt, inputData.topPrice + STOP_LIMIT_SHIFT.get(symbol), inputData.topPrice);

                    const stopOrderRaw = await sellFuturesStopLossLimit(symbol, currentPosition.positionAmt, stopLossNumPrice, stopLossNumPrice + STOP_LIMIT_SHIFT.get(symbol));
                    const stopOrder: FuturesOrderModel = new FuturesOrderModel(stopOrderRaw);
                    const takeOrder: FuturesOrderModel = new FuturesOrderModel(takeOrderRaw);
                    if (stopOrder.orderId === 0 || takeOrder.orderId === 0) {
                        sendEmail('Application was stopped due to wrong limit settings');
                        return;
                    }
                    sellSLOrderId = stopOrder.orderId.toString();
                    sellTpOrderId = takeOrder.orderId.toString();

                    sendEmail("stop order: " + stopOrder.toOrderString() + "######### take order: " + takeOrder.toOrderString());

                    // end

                    buy = false;
                    sell = true;
                } else if (actBuyOrder.status === 'EXPIRED') {
                    sendEmail('Application was stopped due to lower price to bottom price');
                    return; // EXIT
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

            if (actTPSellOrder.status === 'FILLED') {
                cancelFuturesOrderIfActive(symbol, sellSLOrderId);
                sendEmail('Take profit executed: ' + actTPSellOrder.toOrderString())
                buy = true;
                sell = false;
            }
            if (actSLSellOrder.status === 'FILLED') {
                cancelFuturesOrderIfActive(symbol, sellTpOrderId);
                sendEmail('Stop loss executed, Exited: ' + actTPSellOrder.toOrderString());
                return; // EXIT
            }
        }

        end();
    }, checkTime).run();



}

run();
// test();
