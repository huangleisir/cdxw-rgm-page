/**
 *小贷首页选择跳转到哪个页 
 * created by chengjun.zhu@jieshunpay.cn
 */
require("./public_module");
module.exports = (function($) {

	var returnResult = {},
		userInfoUrl = "app/rest/loan/front/getUserInfo";

	/**
	 * 获取用户信息
	 * @param {Object} callback
	 */
	returnResult.getUserInfo = function(callback) {
		postData(userInfoUrl, {}, function(res) {
			var href = "",
				param = {};
			if(res.code == "200") {

				param.isBindCard == res.data.isBindCard;
				param.isRealName == res.data.isRealName;
				if(parseInt(res.data.isBindCard) == 0 || parseInt(res.data.isRealName) == 2) {
					href = "jxd/loan/borrow_index_unlogin.html";

				} else if(res.data.totaLimit <= 0) {
					if(res.data.userType == "1") { //1-内部员工 
						href = "jxd/loan/borrow_index.html";
					} else if(res.data.userType == "0") {
						href = "jxd/loan/borrow_index_unlogin.html";
					} else {
						href = "jxd/loan/borrow_index_zero.html";
					}

				} else {
					href = "jxd/loan/borrow_index.html";

				}

				if(callback) {
					//有回调FUNC传入时则回调，无回调时跳转页面
					callback(href);
				} else {
					openWindow(href, href, param);
				}

			} else {
				$.toast(res.msgContent);
			}

		}, function(err) {

		}, {
			async: false
		})
	};
	//跳转页面
	returnResult.pageGo = function() {

		//判断是否已登录
		if(login.isLogin()) { //已登录
			returnResult.getUserInfo();
		} else { //未登录
			var goHref = "jxd/loan/borrow_index_unlogin.html",
				goParam = {};
			openWindow(goHref, goHref, goParam);
		}

	};

	/**
	 * 获取小贷系统入口跳转URL
	 */
	returnResult.getForwardURL = function(callback) {

		var forwardURL = "";

		if(login.isLogin()) { //已登录
			returnResult.getUserInfo(function(href) {
				forwardURL = href;
				callback && callback(forwardURL);
			});
		} else {
			//未登录
			forwardURL = "jxd/loan/borrow_index_unlogin.html";
			callback && callback(forwardURL);
		}
	};

	return returnResult;

})(mui)