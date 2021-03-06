export const FUTURES_API_URL = 'https://fapi.binance.com';
export const FUTURES_API_MARK_PRICE_PATH = '/fapi/v1/premiumIndex';

export const ORDER_TYPE_TAKE_PROFIT_LIMIT = "TAKE_PROFIT";
export const ORDER_TYPE_STOP_LOSS_LIMIT = "STOP";

export const FUTURES_PRICE_PRECISION_MAPPING = new Map();
FUTURES_PRICE_PRECISION_MAPPING.set('BTCUSDT',     {
    pricePrecision: 2,
    quantityPrecision: 3
});

export const STOP_LIMIT_SHIFT = new Map();
STOP_LIMIT_SHIFT.set('BTCUSDT', 2);

