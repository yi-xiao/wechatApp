const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const port = '8088';
const wechat = require('./wechat/wechat');
const config = require('./config/config.json');
const app = express();//实例
const server = http.createServer(app);

let webchatApp = new wechat(config);

app.get('/', (req,res,next) => {
    // res.send('hello World');
    // webchatApp.auth(req,res);
    // webchatApp.getAccessToken().then(function (data) {
        // res.send(data); //返回的token
        // webchatApp.createMenu(data); //创建菜单
    // });
    res.send('hello')
});

app.post('/', function (req, res) {
    webchatApp.handleMsg(req, res);
});

server.listen(port);
// app.listen(8088, () => {
//    console.log('ok') ;
// });

