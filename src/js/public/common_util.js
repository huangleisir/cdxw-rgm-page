/**
 * 常用判断方法等
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */

(function($) {
	var returnResult = {};
	/**
	 * 验证码倒计时
	 */
	returnResult.timeDown = function(element, t) {
		var obj = $(element);
		t = (t == 0) ? 0 : t || 60;
		if(t == 0) {
			returnResult.stopTimeDown(element);
		} else {
			obj.attr("disabled", true);
			obj.addClass("disabled");
			obj.addClass("timedowning");
			obj.addClass("btn-off");
			//var tryText = "(" + t + "秒)重新获取";
			var tryText = t + "秒";
			obj.html(tryText);
			t--;
			returnResult.timeout = setTimeout(function() {
				returnResult.timeDown(element, t);
			}, 1000);
		}
	};

	/**
	 * 停止倒计时
	 * @param {Object} element
	 */
	returnResult.stopTimeDown = function(element) {
		var obj = $(element);
		obj.removeAttr("disabled");
		obj.removeClass("disabled");
		obj.removeClass("timedowning");
		obj.removeClass("btn-off");
		var tryText = "获取验证码";
		obj.attr("status",0);
		obj.html(tryText);
		clearTimeout(returnResult.timeout);
	}

	/**
	 * 
	 * @param {Object} type:1钱包访问出错，2收银台访问出错
	 */
	returnResult.preventAccess = function(type) {
		alert("系统繁忙,请重试");
	
		//默认为钱包出错返回数据
		var closeData = JSON.stringify({
			type: 2
		});

		if(type == 2) {
			closeData = "-1";
		}

		if(!($.os.plus && window.plus)) {
			if(window.jstwebview) {
				window.jstwebview.invokeNative(closeData);
			} else if(window.jspay) {
				window.jspay.payResultFromJs(closeData);
			} else if($.os.ios && window.webkit) {
				//IOS交互
				window.webkit.messageHandlers.invokeNative.postMessage(closeData);
			} else {
				window.history.go(-1);
			}
		} else {
			$.plusReady(function() {
				plus.webview.currentWebview().close();
			});
		}
		return false;
	}
	
	
	/**
	 * 距离格式化
	 * @param {Object} element
	 */
	returnResult.parseDistance = function(distance) {
		var _distance = 0;
		try {
			_distance = parseFloat(distance) || 0;
			if(_distance < 1000 && _distance > 0) {
				_distance = Math.round(_distance) + "米";
			} else if(_distance > 1000) {
				_distance = (Math.round(_distance / 100) / 10).toFixed(1) + "公里";
			}
		} catch(e) {
			//TODO handle the exception
		}
		return _distance;
	}
	
	/**
	 * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
	 * 即谷歌、高德 转 百度
	 * @param lng
	 * @param lat
	 * @returns {*[]}
	 */
	returnResult.marsCoordTobdCoord = function(lng,lat) {
		//定义一些常量
		var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
		var PI = 3.1415926535897932384626;
		var a = 6378245.0;
		var ee = 0.00669342162296594323;
	    var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
	    var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
	    var bd_lng = z * Math.cos(theta) + 0.0065;
	    var bd_lat = z * Math.sin(theta) + 0.006;
	    return [bd_lng, bd_lat];
	}

	window.commonUtil =  returnResult;
})(jQuery);