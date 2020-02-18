module.exports = {
    tsapi: {
        host: 'https://api-demo.fxcm.com',
        access_token: '',
        headers: {
            'User-Agent': 'request',
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': '63fc1b5e33daf6eb41b1b784e4b97727e8fa359a'          
        },
        apis: {
            instruments: {
                method: 'GET',
                uri: '/trading/get_instruments'
            },
            subscribe: {
                method: 'POST',
                uri: '/trading/subscribe',
            },
            unsubscribe: {
                method: 'POST',
                uri: '/trading/unsubscribe'
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