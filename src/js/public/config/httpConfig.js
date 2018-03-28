/**
 * HTTP环境选择
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
window.httpConfig = (function($) {
	var returnResult = {};

	returnResult.getServer = function(index) {
		var server = {};

		index = parseInt(index);

		if(index <= 0 || isNaN(index)) {
			index = 5; //默认为测试环境
		}

		switch(index) {

			case 1:
				//开发环境
				server.remoteServer = "http://10.101.130.9:8113/apph5/page/home/";
				server.httpServer = "http://10.101.130.9:8082/";
				server.cashCenterHttpServer = "http://10.101.130.9:19080/";
				server.payBeforeHttpServer = "http://10.101.130.9:8910/";
				server.smartParkHttpServer = "http://10.101.130.22:8178/";
				break;
			case 2:
				//测试环境
				server.remoteServer = "http://testjsjk.jieshunpay.cn:8113/apph5/page/home/"; //APP启动入口
				server.httpServer = "http://testjsjk.jieshunpay.cn:18114/"; //APP接口请求地址
				server.cashCenterHttpServer = "http://jsjktest.jieshunpay.cn:19080/"; //统一收银台前置请求地址
				server.payBeforeHttpServer = "http://testjsjk.jieshunpay.cn:8113/cashdeskfront/"; //收银台前置接口请求地址
				server.smartParkHttpServer = "http://jsjktest.jieshunpay.cn:18278/"; //停车前置
				break;
			case 3:
				//演练环境
				server.remoteServer = "http://testjsjk.jieshunpay.cn:18113/apph5/page/home/";
				server.httpServer = "http://testjsjk.jieshunpay.cn:8082/";
				server.cashCenterHttpServer = "http://jsjktest.jieshunpay.cn:19180/";
				server.payBeforeHttpServer = "http://testjsjk.jieshunpay.cn:8910/";
				server.smartParkHttpServer = "http://testjsjk.jieshunpay.cn:38178/";
				break;
			case 4:
				//灰度环境
				server.remoteServer = "http://hdjsjk.jieshunpay.cn:8113/apph5/page/home/";
				server.httpServer = "http://hdjsjk.jieshunpay.cn:18090/";
				server.cashCenterHttpServer = "http://hdjsjk.jieshunpay.cn:19080/";
				server.payBeforeHttpServer = "http://hdjsjk.jieshunpay.cn:18091/";
				server.smartParkHttpServer = "http://hdjsjk.jieshunpay.cn:8179/";
				break;
			case 5:
				//生产环境
				server.remoteServer = "http://scjsjk.jieshunpay.cn:8088/page/home/";
				server.httpServer = "https://app.jieshunpay.cn/";
				server.cashCenterHttpServer = "https://app.jieshunpay.cn/";
				server.payBeforeHttpServer = "https://app.jieshunpay.cn/";
				server.smartParkHttpServer = "https://app.jieshunpay.cn/";
				break;
			default:
				break;
		}

		return server;
	};

	return returnResult;

})(jQuery);