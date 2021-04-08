import {FUTURES_PRICE_PRECISION_MAPPING} from "./constants";
import {cancelFuturesOrder, checkOrderStatus} from "../binance/authenticatedRestApi";
import {FuturesOrderModel} from "../model/futuresOrder.model";

export function toFixed(num: number, fixed: number) {
    const power = Math.pow(10, fixed || 0);
    const converted =  Math.floor(num * power) / power;
    return converted.toString();
};

export function extractMarketFromPosition(symbol: string, positions: any) {
    let markets = Object.keys(positions);
    let position: any;
    for (let market of markets) {
        let obj = positions[market], size = Number( obj.positionAmt );
        if (obj.symbol ===symbol) {
            position = obj;
        }
    }
    return position;
}

export function getFutureCoinQuantity(symbol: string, limitPrice: number, usdtAmount: number) {
    const precisionModel = FUTURES_PRICE_PRECISION_MAPPING.get(symbol);
    const quantity = usdtAmount / limitPrice;
    return toFixed(quantity, precisionModel.quantityPrecision);
}

export function getFutureCoinPrice(symbol: string, limitPrice: number) {
    const precisionModel = FUTURES_PRICE_PRECISION_MAPPING.get(symbol);
    return toFixed(limitPrice, precisionModel.pricePrecision);
}

export async function cancelFuturesOrderIfActive(symbol: string, orderId: string) {
    const orderDetailRaw: any = await checkOrderStatus(symbol, orderId);
    const orderDetail: FuturesOrderModel = new FuturesOrderModel(orderDetailRaw);
    if (orderDetail.status !== 'FILLED') {
        await cancelFuturesOrder(symbol, orderId);
    }
}

