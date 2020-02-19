const common = require('./common.js');
const axios = require('axios');
const querystring = require('querystring');

module.exports = {
    // init: (config, socket, callback) => {
    //     socket = io(config.host, {
    //         query: querystring.stringify(config.access_token)
    //     });
    //     socket.on('connect', () => {
    //         config.headers['Authorization'] = `Bearer ${socket.id}${config.access_token}`;
    //         common.log('socket.io connected. bearer = ', config.headers['Authorization']);
    //         callback(socket);
    //     });
    //     socket.on('connect_error', (err) => {
    //         common.log('socket.io connection err: ', err);
    //         config.headers['Authorization'] = '';
    //     });
    //     socket.on('error', (err) => {
    //         common.log('socket.io generic error: ', err);
    //         config.headers['Authorization'] = '';
    //     });
    //     socket.on('disconnect', () => {
    //         common.log('socket.io disconnected.');
    //         config.headers['Authorization'] = '';
    //     });
    // },
    // getInstruments: (config, callback) => {
    //     axios({
    //         headers: config.headers,
    //         baseURL: config.host,
    //         url: config.apis.instruments.uri,
    //         method: config.apis.instruments.method
    //     }).then(data => {
    //         callback(data.data.data.instrument);
    //     }).catch(err => {
    //         common.log('error in getInstruments():', err);
    //     })
    // },
    getInstrumentsA: async (config) => {
        const res = await axios({
            headers: config.headers,
            baseURL: config.host,
            url: config.apis.instruments.uri,
            method: config.apis.instruments.method
        });
        return res.data.data.instrument;
    },
    // subscribe: (config, pairs, callback) => {
    //     axios({
    //         headers: config.headers,
    //         baseURL: config.host,
    //         url: config.apis.subscribe.uri,
    //         method: config.apis.subscribe.method,
    //         data: querystring.stringify({ "pairs": pairs })
    //     }).then(data => {
    //         callback(data.data.pairs);
    //     }).catch(err => {
    //         common.log('error in subscribe():', err);
    //     })
    // },
    subscribe: async (config, pairs) => {
        const res = await axios({
            headers: config.headers,
            baseURL: config.host,
            url: config.apis.subscribe.uri,
            method: config.apis.subscribe.method,
            data: querystring.stringify({ "pairs": pairs })
        });
        return res.data.pairs;
    }
};