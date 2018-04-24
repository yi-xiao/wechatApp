'use strict';

const crypto = require('crypto');//加密模块
const https = require('https');
const fs = require('fs');
const util = require('util');
const URL = require('url');
const accessToken = require('./cache');
const parseString = require('xml2js').parseString;
const msg = require('./msg');

const WeChat = function(config) {
    this.config = config;
    this.token = config.token;
    this.appId = config.app_id;
    this.appScrect = config.app_secret;
    this.apiDomain = config.api_domain;
    this.apiUrl = config.api_url;

    this.requestGet = function (url) {
        return new Promise(function (resolve, reject) {
            https.get(url, function (res) {
                let result = "", _info = '';
                res.on('data', function (data) {
                    _info = data;

                    console.log("原始: %s",data)
                });
                res.on('end', function () {
                    // _info = JSON.stringify(_info);
                    // result = JSON.stringify(_info);
                    // console.log("转化后: %s",result)
                    resolve(_info);
                });
            }).on('error', function (err) {
                reject(err);
            });
        });
    };

    this.requertPost = function (url, data) {
        return new Promise(function (resolve, reject) {
            let urlData = URL.parse(url);

            let options = {
                hostname: urlData.hostname,
                path: urlData.path,
                method: 'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(data,'utf-8')
                }
            };

            let req = https.request(options, function (res) {
                let buffer = [], result = '';

                res.on('data', function (data) {
                    buffer.push(data);

                    result = new Buffer(data);
                });

                res.on('end', function () {
                    // result = Buffer.concat(buffer).toString('utf-8');
                    console.log(result);
                    resolve(result)
                })
            }).on('errer', function (err) {
                reject(err);
            });

            req.write(data);
            req.end();
        })
    }
};
//获取信息
WeChat.prototype.auth = function (req,res) {
    let siganture = req.query.signature,
        timestamp = req.query.timestamp,
        nonce = req.query.nonce,//随机数
        echostr = req.query.echostr;//随机字符串

    let arr = [this.config.token, timestamp, nonce];

    arr.sort();

    let tempStr = arr.join('');

    const hashCode = crypto.createHash('sha1');

    let resultCode = hashCode.update(tempStr,'utf-8').digest('hex');

    if(resultCode == siganture){
        res.send(echostr);
    }else{
        res.send('mismatch');
    }
};
//获取token
WeChat.prototype.getAccessToken = function () {
    let that = this;

    return new Promise(function (resolve, reject) {
        let currentTime = new Date().getTime();

        let url = util.format(that.apiUrl.access_token_api, that.apiDomain, that.appId, that.appScrect);
        console.log('url: %s',url);
        if(accessToken.access_token === "" || accessToken.expries_time < currentTime){
            that.requestGet(url).then(function (data) {
                let result = JSON.parse(data);

                console.log("data: %s", data)

                if(data.indexOf("errcode")<0){
                    accessToken.access_token = result.access_token;
                    accessToken.expries_time = new Date().getTime() + (parseInt(result.expires_in) - 200) * 1000;

                    fs.writeFile('./wechat/cache.json', JSON.stringify(accessToken));

                    resolve(accessToken.access_token);
                }else{
                    resolve(result);
                }
            })
        }else{
            resolve(accessToken.access_token);
        }
    }).catch(function (err) {
        reject(err)
    })
};
//创建菜单
WeChat.prototype.createMenu = function (data) {
    let that = this;

    let url = util.format(that.apiUrl.creatMenu, that.apiDomain, data);
    console.log('create_url: %s',url);

    that.requertPost(url, JSON.stringify(that.config.menu)).then(function (data) {
        console.log('post_menu_result: %s', data);
    })
};

WeChat.prototype.handleMsg = function (req,res) {
    let buffer = [], _info = '';

    req.on('data', function (data) {
        buffer.push(data)
        // console.log('post_data:%s', data)
        _info = data;
    });

    req.on('end', function () {
        let msgXml = _info;
        // console.log('msgXml: %s',msgXml)
        parseString(msgXml, {explicitArray: false}, function (err,result) {
            if(!err){
                console.log("xml: %s",JSON.stringify(result.xml))
                result = result.xml;

                let toUser = result.ToUserName,//消息来源，发送者账号（openid）
                    fromUser = result.FromUserName;//消息来源，开发者微信号
                let replyText = '',
                    txt_type = result.MsgType.toLowerCase();

                if(txt_type === 'event'){//推送事件
                    switch(result.Event.toLowerCase()){
                        case 'subscribe'://关注
                            replyText = msg.txtMsg(fromUser, toUser, '欢迎关注我的测试号~~');
                            res.send(replyText);
                            break;
                        case 'unsubscribe'://取消
                            res.send('');
                            break;
                        case 'view'://链接跳转
                            replyText = msg.txtMsg(fromUser, toUser, '进入了页面~~');
                            // console.log('进入了页面');
                            res.send(replyText);
                            break;
                        case 'scan'://已关注扫码
                            replyText = msg.txtMsg(fromUser, toUser, '扫了码~~');
                            res.send(replyText);
                            break;
                        case 'location'://上报地理事件
                            replyText = msg.txtMsg(fromUser, toUser, '上报了地址~~');
                            res.send(replyText);
                            break;
                        case 'click'://点击事件
                            let contentArr = [
                                {title:"Node.js 微信自定义菜单",description:"使用Node.js实现自定义微信菜单",picUrl:"http://img.blog.csdn.net/20170605162832842?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast",url:"http://blog.csdn.net/hvkcoder/article/details/72868520"},
                                {title:"Node.js access_token的获取、存储及更新",description:"Node.js access_token的获取、存储及更新",picUrl:"http://img.blog.csdn.net/20170528151333883?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast",url:"http://blog.csdn.net/hvkcoder/article/details/72783631"},
                                {title:"Node.js 接入微信公众平台开发",description:"Node.js 接入微信公众平台开发",picUrl:"http://img.blog.csdn.net/20170605162832842?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast",url:"http://blog.csdn.net/hvkcoder/article/details/72765279"}
                            ];

                            replyText = msg.newsMsg(fromUser, toUser, contentArr);
                            // console.log(replyText);
                            // console.log('================>')
                            res.send(replyText);
                            break;
                    }
                }
                else{
                    if(txt_type === 'text'){
                        //文本消息
                        replyText = msg.txtMsg(fromUser, toUser, '这是文本消息');
                        res.send(replyText);
                    }
                    if(txt_type === 'voice'){
                        //语音消息
                        replyText = msg.txtMsg(fromUser, toUser, '这是语音消息~~');
                        res.send(replyText);
                    }
                    if(txt_type === 'image'){
                        //图片消息
                        replyText = msg.txtMsg(fromUser, toUser, '这是图片消息~~');
                        res.send(replyText);
                    }
                    if(txt_type === 'video'){
                        //视频消息
                        replyText = msg.txtMsg(fromUser, toUser, '这是视频消息~~');
                        res.send(replyText);
                    }
                    if(txt_type === 'link'){
                        //链接消息
                        replyText = msg.txtMsg(fromUser, toUser, '这是链接消息~~');
                        res.send(replyText);
                    }
                    if(txt_type === 'shortvideo'){
                        //小视频消息
                        replyText = msg.txtMsg(fromUser, toUser, '这是小视频消息~~');
                        res.send(replyText);
                    }
                    if(txt_type === 'location'){
                        //地理位置消息
                        replyText = msg.txtMsg(fromUser, toUser, '这是地理位置消息~~');
                        res.send(replyText);
                    }
                }
            }else{
                console.log("error: %s",err);
            }
        })
    });
};

module.exports = WeChat;