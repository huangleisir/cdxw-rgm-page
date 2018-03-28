/**
 * localStorage操作
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */

window.local = {
	setItem: function(vkey, value) {
		if(!stringUtil.isEmpty(vkey)) {
			window.localStorage.setItem(vkey, value);
		}
	},
	getItem: function(vkey) {
		var resultStr = '';
		if(!stringUtil.isEmpty(vkey)) {
			resultStr = window.localStorage.getItem(vkey);
		}
		return resultStr;
	},
	removeItem: function(vkey) {
		!stringUtil.isEmpty(vkey) && window.localStorage.removeItem(vkey);
	},
	clear: function() {
		var deviceFinger = local.getItem("deviceFinger"),
			clientId = local.getItem("clientId"),
			runtime = local.getItem("runtime");
		window.localStorage.clear();
		window.localStorage.setItem("deviceFinger", deviceFinger); //设备信息不清除
		window.localStorage.setItem("clientId", clientId);
		window.localStorage.setItem("runtime", runtime);
	}
};