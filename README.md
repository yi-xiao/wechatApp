# wechatApp
研究微信公众号开发

参考文章github地址：https://github.com/SilenceHVK/wechatByNode

# v1.0.0 2018.05.12 

采坑点：<br>
* 修改测试号接口配置注意事项：1.服务器可用，2.调用auth身份认证接口

# v1.0.0 2018.04.25 0:39
稍微优化了下目录结构，很遗憾忽略表操作并不生效，后续会继续修正

# v1.0.0 2018.04.24
初步功能：<br>
* 1.access_token的获取<br>
* 2.基本类型的判断<br>
* 3.文本消息和图文消息的回复<br>
* 4.auth信息的获取(尚未成功验证)<br>
* 5.公众号菜单的创建<br>


涉及主要模块使用：<br>
* 1.https模块的get与post方法<br>
* 2.fs模块读取和修改文件内容<br>
* 3.xml2js模块的parseString方法获取xml的结构<br>
