const wechat = require('../wechat/wechat');
const config = require('../config/config.json');
const router = require('express').Router();

let webchatApp = new wechat(config);

router.post('/', function (req, res) {
    webchatApp.handleMsg(req, res);
});

router.get('/',require('./login'));

module.exports = router;