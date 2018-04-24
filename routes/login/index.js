const wechat = require('../../wechat/wechat');
const config = require('../../config/config.json');
const router = require('express').Router();

let webchatApp = new wechat(config);

router.get('/', (req,res,next) => {
console.log('>>>>>>>>')
    //webchatApp.getAccessToken().then(function (data) {
        // res.send(data); //返回的token
        // webchatApp.createMenu(data); //创建菜单
     //});
    res.render('index')
});

module.exports = router;