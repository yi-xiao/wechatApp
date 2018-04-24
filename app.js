const express = require('express');
const http = require('http');
const port = '8088';
const app = express();//实例
const server = http.createServer(app);
const path = require('path');
const ejs = require('ejs');
const routers = require('./routes');

app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);//注册模板
app.set('view engine', 'html');
app.set('view cache', false);

app.use('/',routers);

server.listen(port);

