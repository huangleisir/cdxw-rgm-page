/**
 * 常量定义
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
window.constant = (function($) {

	var returnResult = {},
		/**
		 * 获取webroot路径
		 */
		getWebroot = function() {
			var _return = {
					rootPath: "",
					base: ""
				},
				pathArray = ['/page/', '/public/', '/cashdesk/', '/smartpark/', '/jxd/', '/payment/'],
				findIndex = -1, //查找路径结果
				pathName = window.document.location.pathname,
				protocolText = location.protocol + "//";

			for(var key in pathArray) {
				var _index = pathName.indexOf(pathArray[key]);
				if(_index != -1) {
					findIndex = _index;
					break;
				}
			}
			if(findIndex != -1) {
				_return.rootPath = pathName.substring(0, findIndex + 1);
				_return.base = protocolText + location.host + _return.rootPath;
			}
			return _return;
		},
		server = httpConfig.getServer();
	webroot = getWebroot();
	returnResult.rootPath = webroot.rootPath;
	returnResult.base = webroot.base;

	returnResult.imgSpacename = '../../img/'; //图片空间

	//APP接口请求地址
	returnResult.httpServer = server.httpServer;

	//统一收银台前置请求地址
	returnResult.cashCenterHttpServer = server.cashCenterHttpServer;

	//收银台前置接口请求地址
	returnResult.payBeforeHttpServer = server.payBeforeHttpServer;

	//城市停车接口地址
	returnResult.smartParkHttpServer = server.smartParkHttpServer;

	//七牛上传文件服务器
	returnResult.qiniuUploadServer = "http://up-z2.qiniu.com/";

	//returnResult.duration = $.os.ios ? 200 : 350; //Webview窗口动画的持续时间
	returnResult.appVersion = "100";
	returnResult.moneySymbol = "¥"; //人民币符号
	returnResult.jstCardMaxBalance = 5000; //预付卡最大充值金额
	returnResult.sceneCode = {
		SCENECODE_ZL: "020200005", //中粮扫码支付
		REPAYMENT_XD: "030100004" //小贷系统主动还款
	}

	//短信场景码
	returnResult.smsSceneCode = {
		register: "3001", //注册
		forgetPwd: "3002" //忘记密码
	};

	returnResult.templetStyle = "OTHER"; // 页面模板风格 JSH-捷生活 JTC-捷停车 ZL-中粮 ZHTC-智慧停车

	//项目名称，public_mobile里根据此名称判断初始化数据::cashdesk统一收银台,account第三方钱包,app金科APP环境,weixin_smartpark停车微信环境
	returnResult.appName = "app";

	return returnResult;
})(jQuery);