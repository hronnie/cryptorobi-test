export class FuturesOrderModel {
    orderId: number;
    symbol: string;
    status: string;
    clientOrderId: string;
    price: string;
    avgPrice: string;
    origQty: string;
    executedQty: string;
    cumQuote: string;
    timeInForce: string;
    type: string;
    reduceOnly: boolean;
    closePosition: boolean;
    side: string;
    positionSide: string;
    stopPrice: string;
    workingType: string;
    priceProtect: boolean;
    origType: string;
    time: Date;
    updateTime: Date;

    constructor(obj?: any) {
        this.orderId = obj && obj.orderId || 0;
        this.symbol = obj && obj.symbol || '';
        this.status = obj && obj.status || '';
        this.clientOrderId = obj && obj.clientOrderId || '';
        this.price = obj && obj.price || '';
        this.avgPrice = obj && obj.avgPrice || '';
        this.origQty = obj && obj.origQty || '';
        this.executedQty = obj && obj.executedQty || '';
        this.cumQuote = obj && obj.cumQuote || '';
        this.timeInForce = obj && obj.timeInForce || '';
        this.type = obj && obj.type || '';
        this.reduceOnly = obj && obj.reduceOnly || false;
        this.closePosition = obj && obj.closePosition || false;
        this.side = obj && obj.side || '';
        this.positionSide = obj && obj.positionSide || '';
        this.stopPrice = obj && obj.stopPrice || '';
        this.workingType = obj && obj.workingType || '';
        this.priceProtect = obj && obj.priceProtect || false;
        this.origType = obj && obj.origType || '';
        this.time = obj && this.setTime(obj.time) || new Date();
        this.updateTime = obj && this.setTime(obj.updateTime) || new Date();
    }

    setTime(timeNum: number) {
        let timeItem = new Date();
        timeItem.setTime(timeNum);
        return timeItem;
    }

}
