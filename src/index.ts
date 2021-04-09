import {getChannelData} from "./dao/realTimeDbDAO";
import {getFutureMarkPrice} from "./binance/publicRestApi";
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


async function run() {

    console.log('################## Welcome to Crypto Robi ##################');
    sendEmail('################## Welcome to Crypto Robi ##################');

    let buy = true;
    let sell = false;
    let buyOrderId: string = '';
    let sellTpOrderId: string = '';
    let sellSLOrderId: string = '';
    const checkTime = 2000;

    AsyncPolling(async (end: any) => {
        // Get main configuration
        const inputData: ChannelInputModel = await getChannelData();

        // ##### Checking app status ######
        if (inputData.appStatus === 'STOP') {
            await sendEmail('Application was stopped from outside');
            process.exit();
        }
        // END ##### Checking app status ######

        const symbol = `${inputData.coinTo}${inputData.coinFrom}`;

        // Getting actual price
        const actPriceResponse = await getFutureMarkPrice(symbol);
        const actPrice = actPriceResponse?.data?.markPrice;

        console.log('actPrice - starting cycle', actPrice);


        // ******************************************
        // *********** BUY SIDE *********************
        // ******************************************
        if (buy) {

            if (buyOrderId === '') {  // If there is no buy order yet
                const buyOrderRaw: FuturesOrderModel =
                    await buyFutureLimit(symbol, inputData.amountFromCoin, inputData.bottomPrice);
                const buyOrderResult: FuturesOrderModel = new FuturesOrderModel(buyOrderRaw);
                buyOrderId = buyOrderResult.orderId.toString();
                console.log('#### Buy order has been created. buyOrderId = ', buyOrderResult);
            } else {  // If there is already a buy order - polling the status
                const actBuyOrderRaw: any = await checkOrderStatus(symbol, buyOrderId);
                const actBuyOrder: FuturesOrderModel = new FuturesOrderModel(actBuyOrderRaw);
                if (actBuyOrder.status === 'FILLED') {  // Buy order is filled: reset values and set Sell orders (TP and SL)
                    console.log('Buy order has been filled. actBuyOrder = ', actBuyOrder);
                    buyOrderId = '';
                    sendEmail('Vettem: ' + actBuyOrder.toOrderString());

                    // Buy order is filled, let's set take profit and stop loss orders:
                    const positions = await getFuturePosition();
                    const currentPosition =  extractMarketFromPosition(symbol, positions);

                    // Stop loss price = bottom price - stop loss percentage
                    const stopLossNumPrice: number = inputData.bottomPrice - (Math.ceil(inputData.bottomPrice * (inputData.stopLossRatio / 100)));

                    const takeOrderRaw = await sellFuturesTakeProfitLimit(symbol, currentPosition.positionAmt, inputData.topPrice, inputData.topPrice + STOP_LIMIT_SHIFT.get(symbol));
                    const stopOrderRaw = await sellFuturesStopLossLimit(symbol, currentPosition.positionAmt, stopLossNumPrice, stopLossNumPrice + STOP_LIMIT_SHIFT.get(symbol));
                    const stopOrder: FuturesOrderModel = new FuturesOrderModel(stopOrderRaw);
                    const takeOrder: FuturesOrderModel = new FuturesOrderModel(takeOrderRaw);

                    if (stopOrder.orderId === 0 || takeOrder.orderId === 0) {  // sell order wasn't accepted for some reason ==> EXIT
                        await sendEmail('Application was stopped due to wrong limit settings');
                        process.exit();
                    }

                    sendEmail("stop order: " + stopOrder.toOrderString() + "######### take order: " + takeOrder.toOrderString());
                    console.log('Stop order: ', stopOrder);
                    console.log('Take order: ', takeOrder);

                    // Sets value for SELL side toggle
                    sellSLOrderId = stopOrder.orderId.toString();
                    sellTpOrderId = takeOrder.orderId.toString();
                    buy = false;
                    sell = true;
                } else if (actBuyOrder.status === 'EXPIRED') {
                    console.log('Application was stopped due to lower price to bottom price')
                    await sendEmail('Application was stopped due to lower price to bottom price');
                    process.exit(); // EXIT
                }
            }
        }

        // ******************************************
        // *********** SELL SIDE *********************
        // ******************************************

        if (sell) {
            // Get actual take profit and stop loss sell orders:
            const actTPSellOrderRaw: any = await checkOrderStatus(symbol, sellTpOrderId);
            const actTPSellOrder: FuturesOrderModel = new FuturesOrderModel(actTPSellOrderRaw);
            const actSLSellOrderRaw: any = await checkOrderStatus(symbol, sellSLOrderId);
            const actSLSellOrder: FuturesOrderModel = new FuturesOrderModel(actSLSellOrderRaw);

            if (actTPSellOrder.status === 'FILLED') {  // Take Profit was filled
                cancelFuturesOrderIfActive(symbol, sellSLOrderId);
                sendEmail('Take profit executed: ' + actTPSellOrder.toOrderString())
                buy = true;
                sell = false;
            }
            if (actSLSellOrder.status === 'FILLED') {   // Stop loss was filled ==> EXIT
                cancelFuturesOrderIfActive(symbol, sellTpOrderId);
                await sendEmail('Stop loss executed, Exited: ' + actTPSellOrder.toOrderString());
                process.exit(); // EXIT
            }
        }

        end();
    }, checkTime).run();

}

run();
