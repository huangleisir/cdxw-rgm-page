/**
 * 字符串操作
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
(function($) {
	var returnResult = {};
	/**
	 * 判断是否为空,为空返回true
	 * @param {Object} target
	 */
	returnResult.isEmpty = function(target) {
		var typeoft = typeof(target);
		if(typeoft === "string") {
			target = target.trim();
			return target == "undefined" || target === "" || target == "\"\"" || target == "\'\'" || target == "null";
		}
		if(typeoft === "object") {
			return $.isEmptyObject(target);
		}
		return target === null || target === undefined;
	};

	/**
	 * 生成随机字符串
	 * @param {Object} length长度
	 */
	returnResult.randomString = function(length) {
		var str = '';
		for(; str.length < length; str += Math.random().toString(36).substr(2));
		return str.substr(0, length);
	};

	// 是否是网址
	returnResult.isURL = function(str) {
		return str.indexOf("http://") == 0 || str.indexOf("https://") == 0;
	};

	/**
	 * 返回多个相同字符
	 * @param {Object} n
	 */
	String.prototype.repeat = function(n) {
		return new Array(n + 1).join(this);
	}

	/**
	 * 处理字符串只显示一部分
	 * @param {Object} options
	 */
	returnResult.infoProtectDeal = function(options) {
		var options = $.extend({
			targetStr: "", //目标字符串
			keepStart: 0, //需保留前几位
			keepEnd: 0, //需保留后几位
			cipherLen: 0 //显示多少个*
		}, options);

		var returnStr = "";
		if(!returnResult.isEmpty(options.targetStr)) {
			if(options.keepStart > options.targetStr.length) {
				//前面要保留的数量已超过最大长度
				returnStr = options.targetStr;
			} else {

				var remainLen = options.targetStr.length - options.keepStart; //去掉前面保留的位数之后，还有多少位

				if(options.keepEnd > remainLen) {
					//后面要保留的位数已超过还剩余的位数
					returnStr = options.targetStr;
				} else {
					var remainCipherLen = options.targetStr.length - options.keepStart - options.keepEnd; //去掉前后保留之后，还有多少个字符需要*
					if(options.cipherLen > 0) {
						//有自定义显示多个*
						remainCipherLen = options.cipherLen;
					}

					returnStr = options.targetStr.slice(0, options.keepStart).concat("*".repeat(remainCipherLen)).concat(options.targetStr.slice(-options.keepEnd));
				}

			}
		}
		return returnStr;

	};


	/**
	 * 字符串格式化(加空格)
	 * type为手机号码或捷顺通卡号码
	 */
	returnResult.FormatNumber = function(str, type) {
		var t = "";
		switch(type) {
			case "mobile":
				for(var n = 0; n < str.length; ++n) {
					n == 3 || n == 7 ? t += " " + str[n] : t += str[n];
				}
				break;
			case "jstcard":
				for(var n = 0; n < str.length; ++n) {
					n == 6 ? t += " " + str[n] : t += str[n];
				}
				break;
		}
		return t;
	};

	/**
	 * 判断数组是否包含某元素
	 */
	returnResult.isInArray = function(arr, str) {
		var self = this;
		var t = false;
		for(var i = 0; i < arr.length; i++) {
			if(arr[i] == str) {
				t = true;
				break;
			}
		}
		return t;
	};
	
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
	
	window.stringUtil = returnResult;
})(jQuery);