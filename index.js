require('dotenv').config();
const common = require('./common.js');
const { tsapi } = require('./config.js');
const io = require('socket.io-client');
const querystring = require('querystring');
const axios = require('axios');

if (process.env['TS_ACCESS_TOKEN']) {
    tsapi.access_token = process.env['TS_ACCESS_TOKEN']
}
common.log(tsapi.host, tsapi.access_token);
const socket = io(tsapi.host, {
    query: querystring.stringify({ access_token: tsapi.access_token })
});
socket.on('connect', () => {
    tsapi.headers['Authorization'] = `Bearer ${socket.id}${tsapi.access_token}`;
    common.log('socket.io connected. bearer = ', tsapi.headers['Authorization']);
});
socket.on('connect_error', (err) => {
    common.log('socket.io connection err: ', err);
});
socket.on('error', (err) => {
    common.log('socket.io generic error: ', err);
    tsapi.headers['Authorization'] = '';
});
socket.on('disconnect', () => {
    common.log('socket.io disconnected.');
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
app.get('/instruments', (req, res) => {
    axios({
        headers: tsapi.headers,
        baseURL: tsapi.host,
        url: tsapi.apis.instruments.uri,
        method: tsapi.apis.instruments.method
    }).then(data => {
        common.log('response=', data.data);
        res.status(200).send(JSON.stringify(data.data));
    });
    // axios.get(common.getUrl(tsapi.host, tsapi.endpoints.instruments.uri), { headers: headers }).then(data => {
    //     console.log(tsapi_request_header);
    //     console.log('data=',data.data);
    //     res.status(200).send(JSON.stringify(data.data));
    // });
    // http.request({
    //     host: config.tsapi_host,
    //     path: '/trading/get_instruments',
    //     method: 'GET',
    //     headers: tsapi_request_header
    // }
    // , (res) => {
    //     var data;
    //     res.on('data', (chunk) => data += chunk);
    //     res.on('end', () => {}); 
    // });
});

app.get('/subscribe', (req, res) => {
    axios({
        headers: tsapi.headers,
        baseURL: tsapi.host,
        url: tsapi.apis.subscribe.uri,
        method: tsapi.apis.subscribe.method,
        data: querystring.stringify({ "pairs": ["EUR/USD", "USD/JPY"] })
    }).then(data => {
        if (data.data.response.executed) {
            common.log('subscription success', data, data.data);
            for (let pair of data.data.pairs) {
                common.log('setting up socket for', pair.Symbol);
                socket.on(pair.Symbol, (data) => common.log("PriceUpdate", JSON.parse(data)));
            }
            res.status(200).send();
        } else {
            common.log(data);
            res.status(400).send();
        }
    }).catch(err => {
        common.log(err);
        res.status(500).send();
    });
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