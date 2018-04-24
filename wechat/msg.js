'use strict';

//文本消息模板
exports.txtMsg = function (toUser, fromUser, content) {
    let xml = '<xml>' +
        '<ToUserName><![CDATA['+toUser+']]></ToUserName>' +
        '<FromUserName><![CDATA['+fromUser+']]></FromUserName>'+
        '<CreateTime>'+(new Date().getTime())+'</CreateTime>'+
        '<MsgType><![CDATA[text]]></MsgType>'+
        '<Content><![CDATA['+content+']]></Content>'+
        '</xml>';

    return xml;
};
//图文消息模板
exports.newsMsg = function (toUser, fromUser, contentArr) {
    let xml = '';

    xml +=   '<xml>' +
                '<ToUserName><![CDATA['+toUser+']]></ToUserName>' +
                '<FromUserName><![CDATA['+fromUser+']]></FromUserName>' +
                '<CreateTime>'+(new Date().getTime())+'</CreateTime>' +
                '<MsgType><![CDATA[news]]></MsgType>' +
                '<ArticleCount>'+contentArr.length+'</ArticleCount>' +
                '<Articles>' ;
    contentArr.filter( item => {
        xml += '<item>' +
                    '<Title><![CDATA['+item.title+']]></Title>' +
                    '<Description><![CDATA['+item.description+']]></Description>' +
                    '<PicUrl><![CDATA['+item.picurl+']]></PicUrl>' +
                    '<Url><![CDATA['+item.url+']]></Url>' +
             '</item>' ;
    });

    xml +=      '</Articles>' +
            '</xml>';

    return xml;
};