/**
 * 提供JS和捷顺SDK交互，SDK指提供给捷停车，中粮等使用的原生SDK包
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = {
	/**
	 * JS call native
	 * @param {Object} jsonObj
	 */
	invokeNative: function(jsonObj) {
		var jsonStr = JSON.stringify(jsonObj);
		if(window.jstwebview) {
			window.jstwebview.invokeNative(jsonStr);
		} else if(mui.os.ios && window.webkit) {
			//IOS交互
			window.webkit.messageHandlers.invokeNative.postMessage(jsonStr);
		}
	},

	/**
	 * 判断是否嵌入至APP
	 */
	isSdkWindow: function() {
		return(window.jstwebview || (mui.os.ios && window.webkit)) && !mui.os.wechat;
	}
};