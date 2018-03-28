/**
 * 配置常用的页面跳转地址
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */

window.appPageConfig = function() {
	var indexURL = "public/home/index.html", //APP首页
		accountURL = "app" == constant.appName ? "page/home/personal.html" : "public/account/account.html"; //个人中心首页
	return {
		indexURL: indexURL, //APP首页
		loginURL: "public/home/login.html", //登录页
		accountURL: accountURL, //个人中心首页
		setURL: "public/account/set.html", //设置页面
		forgetPaypwdURL: "public/account/forget_pay_pwd.html", //忘记了支付密码跳转的页面
		footerUrls: ["page/home/index.html", "page/home/nearby.html", accountURL],
		smartparkFooterUrls: ["smartpark/home/smartpark_index.html", "smartpark/home/smartpark_nearby_app.html", "smartpark/home/smartpark_more.html"],
		weixinHeaderFilter: ["smartpark/park/park_list.html", "smartpark/car/road_stop.html"]
	};
}();