module.exports = {
    tsapi: {
        host: 'https://api-demo.fxcm.com',
        access_token: '',
        headers: {
            'User-Agent': 'request',
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': ''          
        },
        apis: {
            instruments: {
                method: 'GET',
                uri: '/trading/get_instruments'
            },
            subscribe: {
                method: 'POST',
                uri: '/subscribe',
            },
            unsubscribe: {
                method: 'POST',
                uri: '/unsubscribe'
            },
            openTrade: {
                method: 'POST',
                uri: '/trading/open_trade',
            },
            closeTrade: {
                method: 'POST',
                uri: 'trading/close_trade',
            }
        },
        schemas: {
            marketData: {
                pairs: ''
            },
            tradingTable: {
                models: ''
            }
        }
    },
}