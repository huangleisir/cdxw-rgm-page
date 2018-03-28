/**
 * 日期格式化工具
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = (function($) {
	var returnResult = {},
		stringUtil = require("./string_util"),
		timeId = "";

	/**
	 * 将时间错转换为格式化时间，返回字符串
	 *
	 * @param {Object}
	 *            timeStamp:时间错
	 * @param {Object}
	 *            formatstr:格式(yyyy-MM-dd HH:mm:ss等)
	 */
	returnResult.timeFormat = function(timeStamp, formatstr) {
		if(!stringUtil.isEmpty(timeStamp))
			if(formatstr == "yyyy-MM-dd hh:mm:ss.S") {
				var dateStr = new Date(parseInt(timeStamp)).Format(formatstr).toLocaleString();
				if(dateStr.length == 21) {
					dateStr += "00";
				} else if(dateStr.length == 22) {
					dateStr += "0";
				}
				return dateStr;
			} else {
				return new Date(parseInt(timeStamp)).Format(formatstr).toLocaleString();
			}
		else
			return "";
	};
	Date.prototype.Format = function(fmt) {
		var o = {
			"M+": this.getMonth() + 1, //月份   
			"d+": this.getDate(), //日   
			"h+": this.getHours(), //小时   
			"m+": this.getMinutes(), //分   
			"s+": this.getSeconds(), //秒   
			"q+": Math.floor((this.getMonth() + 3) / 3), //季度   
			"S": this.getMilliseconds() //毫秒   
		};
		if(/(y+)/.test(fmt))
			fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for(var k in o)
			if(new RegExp("(" + k + ")").test(fmt))
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	};


	//字符串转日期格式，strDate要转为日期格式的字符串如：20170823183943
	returnResult.formatStrToDate = function(strDate) {
		var dateDetail = strDate.substr(4);
		var theDate = "";
		for(var t = 0; t < dateDetail.length / 2; t++) {
			if(t == 0) {
				theDate += "," + (parseInt(dateDetail.substr(t * 2, 2)) - 1).toString();
			} else {
				theDate += "," + dateDetail.substr(t * 2, 2);
			}
		}
		theDate = "new Date(" + strDate.substr(0, 4) + theDate + ")";
		return eval(theDate);
	};



	//字符串转日期格式，strDate要转为日期格式的字符串如：20170823183943
	returnResult.getDate = function(strDate) {
		var dateDetail = strDate.substr(4);
		var theDate = "";
		for(var t = 0; t < dateDetail.length / 2; t++) {
			if(t == 0) {
				theDate += "," + (parseInt(dateDetail.substr(t * 2, 2)) - 1).toString();
			} else {
				theDate += "," + dateDetail.substr(t * 2, 2);
			}
		}
		theDate = "new Date(" + strDate.substr(0, 4) + theDate + ")";
		return eval(theDate);
	};

	// 累计时间
	returnResult.reckonTime = function(eid, begintime, endtime, sectemp, daytemp, type, fun, downback) {
		var allTime = Date.parse(endtime) - Date.parse(begintime);
		var dayTime = Math.floor(allTime / (1000 * 60 * 60 * 24));
		var hourTime = Math.floor(allTime / (1000 * 60 * 60)) % 24;
		var minTime = Math.floor(allTime / (1000 * 60)) % 60;
		var secTime = Math.floor(allTime / 1000) % 60;

		var timeArry = "";
		hourTime = hourTime <= 9 ? "0" + hourTime : hourTime;
		minTime = minTime <= 9 ? "0" + minTime : minTime;
		secTime = secTime <= 9 ? "0" + secTime : secTime;
		if(dayTime > 0) {
			var stopTime = daytemp.replace(/@dd/g, dayTime).replace(/@hh/g, hourTime).replace(/@mm/g, minTime);
		} else {
			var stopTime = sectemp.replace(/@hh/g, hourTime).replace(/@mm/g, minTime).replace(/@ss/g, secTime);
		}

		//clearTimeout(timeId);

		document.getElementById(eid).innerHTML = stopTime;

		if(type == "timedown") {
			begintime = new Date(Date.parse(begintime) + 1000);
			if(Date.parse(begintime) - 1000 == Date.parse(endtime)) {
				downback && downback();
				type = "timeup";
			}
			timeId = setTimeout(function() {
				returnResult.reckonTime(eid, begintime, endtime, sectemp, daytemp, type, fun, downback)
			}, 1000);
		} else {
			endtime = new Date(Date.parse(endtime) + 1000);
			timeId = setTimeout(function() {
				returnResult.reckonTime(eid, begintime, endtime, sectemp, daytemp, type, fun)
			}, 1000);
		}

		timeArry = [allTime / 1000, dayTime, hourTime, minTime, secTime, type, timeId];
		fun && fun(timeArry);

		//		endtime = new Date(Date.parse(endtime) + 1000);
		//		setTimeout(function() { returnResult.reckonTime(eid, begintime, endtime, sectemp, daytemp) }, 1000);
	}

	// 清除计时
	returnResult.clearReckon = function() {
		clearTimeout(timeId);
	}

	// 把以秒为单位的时间转化成以天/时/分(省略版)
	returnResult.secToHour = function(s, daytemp, hourtemp, mintemp) {

		daytemp = daytemp || "@dd@hh@mm";
		hourtemp = hourtemp || "@hh@mm";
		mintemp = mintemp || "@mm";
		var sec = parseInt(s);
		var day = Math.floor(s / (60 * 60 * 24));
		var hour = Math.floor(s / (60 * 60));
		var min = Math.floor(s / 60);
		var second = s % 60;
		var timeText = "";
		if(day > 0) {
			hour = hour % 24;
			timeText = daytemp.replace(/@dd/g, day).replace(/@hh/g, hour).replace(/@mm/g, min % 60);
		} else if(hour > 0) {
			min = min % 60;
			timeText = hourtemp.replace(/@hh/g, hour).replace(/@mm/g, min);
		} else if(min > 0) {
			timeText = mintemp.replace(/@mm/g, min);
		} else {
			timeText = "少于1分钟";
		}
		return timeText;
	};

	// 把以秒为单位的时间转化成以天/时/分(详细版)
	returnResult.parkTimeFormat = function(s, daytemp, hourtemp) {

		daytemp = daytemp || "@dd@hh@mm";
		hourtemp = hourtemp || "@hh@mm@ss";
		var sec = parseInt(s);
		var day = Math.floor(s / (60 * 60 * 24));
		var hour = Math.floor(s / (60 * 60));
		var min = Math.floor(s / 60);
		var second = s % 60;
		var timeText = "";
		if(day > 0) {
			hour = hour % 24;
			min = min % 60;
			day = day <= 9 ? "0" + day : day;
			hour = hour <= 9 ? "0" + hour : hour;
			min = min <= 9 ? "0" + min : min;
			timeText = daytemp.replace(/@dd/g, day).replace(/@hh/g, hour).replace(/@mm/g, min);
		} else {
			min = min % 60;
			second = second % 60;
			hour = hour <= 9 ? "0" + hour : hour;
			min = min <= 9 ? "0" + min : min;
			second = second <= 9 ? "0" + second : second;
			timeText = hourtemp.replace(/@hh/g, hour).replace(/@mm/g, min).replace(/@ss/g, second);
		}
		return timeText;
	};

	// 倒计时 t-倒计时耗时(秒)，onCall-倒计时进行时回调方法，endCall-倒计时结束时回调方法;
	returnResult.timeFall = function(s, onCall, endCall) {
		var t = parseInt(s);
		var scan = function() {
			if(t == -1) {
				endCall && endCall();
				clearInterval(init);
			} else {
				var houStr = Math.floor(t / 60 / 60);
				var minStr = Math.floor(t / 60 % 60);
				var secStr = t % 60;
				houStr = houStr <= 9 ? "0" + houStr : houStr;
				minStr = minStr <= 9 ? "0" + minStr : minStr;
				secStr = secStr <= 9 ? "0" + secStr : secStr;
				objTime = {
					hh: houStr,
					mm: minStr,
					ss: secStr
				};
				onCall && onCall(objTime);
				t--;
			}
		}
		scan();
		var init = setInterval(scan, 1000);
	}
	return returnResult;
})(mui);