# Crypto Robi application

Crypto Bot



### How to get started
1. Create and setup your firebase database:
   https://dev.to/irohitgaur/how-to-use-firebase-realtime-database-in-a-node-js-app-nn
2. Create a new endpoint in the Realtime Database: 
```
channel = {
    amountFromCoin: 100
    appStatus: "RUN"
    bottomPrice: 58200
    coinFrom: "USDT"
    coinTo: "BTC"
    reinvest: true
    stopLossRatio: 0.2
    toleranceLimit: 1
    topPrice: 58760
}
```

#### Explanation: 
```
bottomPrice = user defined  // bottom of the channel
topPrice = user defined     // top of the channel
coinFrom = user defined  // coin from
coinTo = user defined    // coin to
toleranceLimit = user defined    // the algorithm doesn't need to go to the top or bottom. in %
buy = true   // the actual state for buy/sell - if buy = true it means that it will looking to buy dips
sell = false   // the actual state for buy/sell - if sell = true it means that it will looking to sell dips
amountFromCoin = user defined  // the amount to buy at first in from Coin
amountToCoin - variable   // the amount to sell in To coin
reinvest = true   // if this is true then amountFromCoin will be overwritten with the profit + original amount
buyOrderId - variable    // the latest buy order id. it is for checking status
sellOrderId - variable   // the latest sell order id. it is for checking status
actPrice - variable // actual price for coinFrom/coinTo
checkTime = 1000   // loop time for the main loop in ms
stopLossRatio = 1   // how much percent for the stop loss
```
3. Create a Binance api key:
   https://www.binance.com/en-NG/support/faq/360002502072-How-to-create-API
4. Create a .env file in your project root with the following values:
```
    API_KEY=[binance public api key]
    API_SECRET=[binance secret key]
    GMAIL_ADDRESS=[gmail email address]
    GMAIL_APP_PASSWORD=[gmail password]
```
Please note that if you activated the 2-factor login then you need to use the application password: 
https://support.google.com/mail/answer/185833?hl=en-GB



#### `npm run start:dev`

Starts the application in development using `nodemon` and `ts-node` to do hot reloading.

#### `npm run start`

Starts the app in production by first building the project with `npm run build`, and then executing the compiled JavaScript at `build/index.js`.

#### `npm run build`

Builds the app at `build`, cleaning the folder first.

#### `npm run test`

Runs the `jest` tests once.

#### `npm run test:dev`

Run the `jest` tests in watch mode, waiting for file changes.

#### `npm run prettier-format`

Format your code.

#### `npm run prettier-watch`

Format your code in watch mode, waiting for file changes.

# cryptorobi-test
