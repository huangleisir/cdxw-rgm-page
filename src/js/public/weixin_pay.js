/**
 * 微信支付
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = (function($) {
	require("./window_expansion");
	require("./http_client");
	var returnResult = {},
		stringUtil = require("./string_util");

	// 微信签名数据
	returnResult.wxsigndata = {};
	// 支付交易流水号			
	// 微信js api支付
	returnResult.onBridgeReady = function() {
		returnResult.wxPwdPanelShowedCallback && returnResult.wxPwdPanelShowedCallback();
		WeixinJSBridge.invoke(
			'getBrandWCPayRequest', {
				"appId": returnResult.wxsigndata.appId,
				"timeStamp": returnResult.wxsigndata.timeStamp,
				"nonceStr": returnResult.wxsigndata.nonceStr,
				"package": returnResult.wxsigndata.package,
				"signType": returnResult.wxsigndata.signType,
				"paySign": returnResult.wxsigndata.paySign
			},
			function(res) {
				if(res.err_msg == "get_brand_wcpay_request:ok") {
					returnResult.paySuccessCallBack && returnResult.paySuccessCallBack();
				} else if(res.err_msg == "get_brand_wcpay_request:cancel") {
					if(returnResult.payCancel) {
						returnResult.payCancel();
					} else {
						$.toast('用户取消支付');
					}

				} else if(res.err_msg == "get_brand_wcpay_request:fail") {
					if(returnResult.payFailCallBack) {
						returnResult.payFailCallBack();
					} else {
						$.toast("支付遇到问题,请重试");
					}
				};
			}
		);
	};

	//API
	/**
	 * 发起微信支付
	 * @param {Object} paySuccess:支付成功回调
	 * @param {Object} payFail:支付失败回调
	 * @param {Object} payCancel:中断支付回调
	 * @param {Object} wxPwdPanelShowedCallback:微信密码输入框调起来后回调
	 */
	returnResult.doPay = function(options) {
		var options = options || {};
		returnResult.wxsigndata = options.wxsigndata;
		returnResult.paySuccessCallBack = options.paySuccess;
		returnResult.payFailCallBack = options.payFail;
		returnResult.payCancel = options.payCancel;
		returnResult.wxPwdPanelShowedCallback = options.wxPwdPanelShowedCallback;

		if(!$.os.wechat || stringUtil.isEmpty(returnResult.wxsigndata)) {
			//非微信浏览器环境和请求数据为空的情况下，不处理
			return;
		}
		// 微信JS API支付
		if(typeof WeixinJSBridge == "undefined") {
			if(document.addEventListener) {
				document.addEventListener('WeixinJSBridgeReady', returnResult.onBridgeReady, false);
			} else if(document.attachEvent) {
				document.attachEvent('WeixinJSBridgeReady', returnResult.onBridgeReady);
				document.attachEvent('onWeixinJSBridgeReady', returnResult.onBridgeReady);
			}
		} else {
			returnResult.onBridgeReady();
		}
	};

	return returnResult;
})(mui);