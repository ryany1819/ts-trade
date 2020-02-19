require('dotenv').config();
const common = require('./common.js');
const { tsapi } = require('./config.js');
const io = require('socket.io-client');
const querystring = require('querystring');

if (process.env['TS_ACCESS_TOKEN']) {
    tsapi.access_token = process.env['TS_ACCESS_TOKEN']
}
common.log(tsapi.host, tsapi.access_token);

const fxcmObj = {
    instruments: null,
    active_symbols: null,
    market_prices: {}
}

const fxcmApi = require('./fxcm-api.js');
console.log(tsapi.host, tsapi.access_token)
const socket = io(tsapi.host, {
    query: querystring.stringify({ access_token: tsapi.access_token })
});
// socket.on('connect', () => {
//     tsapi.headers['Authorization'] = `Bearer ${socket.id}${tsapi.access_token}`;
//     common.log('socket.io connected. bearer = ', tsapi.headers['Authorization']);
//     fxcmApi.getInstruments(tsapi, (instruments) => {
//         fxcmApi.instruments = instruments;
//         fxcmObj.active_symbols = [];
//         // collect active pairs
//         for (let inst of instruments) {
//             if (inst.visible) {
//                 fxcmObj.active_symbols.push(inst.symbol);
//             }
//         }
//         if (fxcmObj.active_symbols.length > 0) {
//             // do subscription for each active pair
//             fxcmApi.subscribe(tsapi, fxcmObj.active_symbols, (pairs) => {
//                 for (let pair of pairs) {
//                     socket.on(pair.Symbol, (data) => {
//                         console.log('update')
//                         fxcmObj.market_prices[data.Symbol] = {
//                             time: data.Updated,
//                             rates: data.Rates
//                         }
//                     });
//                 }
//             });
//         }
//     })
// });
socket.on('connect', async () => {
    tsapi.headers['Authorization'] = `Bearer ${socket.id}${tsapi.access_token}`;
    common.log('socket.io connected. bearer = ', tsapi.headers['Authorization']);
    fxcmApi.instruments = await fxcmApi.getInstrumentsA(tsapi);
    fxcmObj.active_symbols = [];
    // collect active pairs
    for (let inst of fxcmApi.instruments) {
        if (inst.visible) {
            fxcmObj.active_symbols.push(inst.symbol);
        }
    }
    if (fxcmObj.active_symbols.length > 0) {
        // do subscription for each active pair
        const pairs = await fxcmApi.subscribe(tsapi, fxcmObj.active_symbols);
        for (let pair of pairs) {
            socket.on(pair.Symbol, (data) => {
                console.log('update')
                fxcmObj.market_prices[data.Symbol] = {
                    time: data.Updated,
                    rates: data.Rates
                }
            });
        }
    }
});
socket.on('connect_error', (err) => {
    common.log('socket.io connection err: ', err);
    tsapi.headers['Authorization'] = '';
});
socket.on('error', (err) => {
    common.log('socket.io generic error: ', err);
    tsapi.headers['Authorization'] = '';
});
socket.on('disconnect', () => {
    common.log('socket.io disconnected.');
    tsapi.headers['Authorization'] = '';
});

// launch express erver
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    console.log('hello world');
    res.status(200).send('hello world');
})
app.get('/instruments', async (req, res) => {
    try {
        const instruments = await fxcmApi.getInstrumentsA(tsapi);
        res.status(200).send(instruments);
    }
    catch (err) {
        res.status(400).send(err);
    }
});

app.post('/subscribe', async (req, res) => {
    try {
        const symbols = req.body.pairs;
        let i = 0;
        while (i < symbols.length) {
            if (fxcmObj.active_symbols[symbols[i]]) symbols.splice(i, 1);
        }
        const pairs = await fxcmApi.subscribe(tsapi, symbols);
        for (let pair of pairs) {
            fxcmObj.active_symbols.push(pair.Symbol);
            socket.on(pair.Symbol, (data) => {
                fxcmObj.market_prices[data.Symbol] = {
                    time: data.Updated,
                    rates: data.Rates
                }
            })
        }
    }
    catch (err) {
        res.status(400).send(err);
    }
    // axios({
    //     headers: tsapi.headers,
    //     baseURL: tsapi.host,
    //     url: tsapi.apis.subscribe.uri,
    //     method: tsapi.apis.subscribe.method,
    //     data: querystring.stringify({ "pairs": ["EUR/USD", "USD/JPY"] })
    // }).then(data => {
    //     if (data.data.response.executed) {
    //         common.log('subscription success', data, data.data);
    //         for (let pair of data.data.pairs) {
    //             common.log('setting up socket for', pair.Symbol);
    //             socket.on(pair.Symbol, (data) => common.log("PriceUpdate", JSON.parse(data)));
    //         }
    //         res.status(200).send();
    //     } else {
    //         res.status(400).send('wasn\'t subscribed.');
    //     }
    // }).catch(err => {
    //     common.log('error in subscription', err);
    //     res.status(500).send();
    // });
});
app.post('/notify', (req, res) => {
    console.log('request coming');
    console.log('req.body', req.body);
    const symbol = req.body.symbol;
    const message = req.body.message;

    if (!symbol || !message) {
        console.log('reject')
        return res.status(400).send();
    }
    console.log('symbol=', symbol, 'message=', message);
    return res.status(200).send();
});


app.listen(PORT, () => {
    console.log(common.getTimeStamp(), 'Server is listening at port ' + PORT);
})

/**
 * typical response of /trading/get_instruments
 * {
 *      "response": {
 *          "executed": true
 *      },
 *      "data": {
 *          "instrument": [
 *              {"symbol":"EUR/USD","visible":true,"order":1},
 *              {"symbol":"USD/JPY","visible":true,"order":2},
 *              {"symbol":"GBP/USD","visible":false,"order":3},
 *              {"symbol":"USD/CHF","visible":false,"order":4},
 *              {"symbol":"EUR/CHF","visible":false,"order":5},
 *              ...
 *          ]
 *      }
 * }
 */