/**
 * 获取设备信息
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
require("./mui_expansion");
module.exports = (function($) {
	var returnResult = {},
		mapUtil = require("./h5_native_plugin").map;
	/**
	 * 获取设备信息，存入缓存
	 */
	returnResult.setDeviceInfo = function() {

		if(!($.os.plus && window.plus)) {
			return;
		}

		var deviceFinger = ($.os.ios ? "3" : "1"),
			joinDeviceFinger = function(code, value) {
				deviceFinger += "|" + code + ":" + value;
			},
			joinCoords = function(latitude, longitude) {
				joinDeviceFinger("1044", latitude || "");
				joinDeviceFinger("1045", longitude || "");
				local.setItem("deviceFinger", deviceFinger);
			};

		var uuid = plus.device.uuid; //设备的唯一标识
		var imei = plus.device.imei; //设备的国际移动设备身份码imei
		var imsi = plus.device.imsi; //设备的国际移动设备身份码imsi
		var resolution = plus.screen.resolutionHeight + "*" + plus.screen.resolutionWidth; //设备屏幕高度分辨率 * 设备屏幕宽度分辨率
		var model = plus.device.model; //设备的型号
		var osname = plus.os.name; //系统名称
		var osversion = plus.os.version; //系统版本信息
		var oslanguage = plus.os.language; //系统语言信息
		var vendor = plus.device.vendor; //设备的生产厂商

		if($.os.ios) {
			joinDeviceFinger("1006", uuid);
			joinDeviceFinger("1008", vendor);
			joinDeviceFinger("1014", resolution);
			joinDeviceFinger("1015", model);
			joinDeviceFinger("1018", osname);
			joinDeviceFinger("1019", osversion);
			joinDeviceFinger("1020", oslanguage);
		} else {
			joinDeviceFinger("1006", uuid);
			joinDeviceFinger("2001", imei);
			joinDeviceFinger("2002", imsi);
			joinDeviceFinger("2014", resolution);
			joinDeviceFinger("2015", model);
			joinDeviceFinger("2018", osname);
			joinDeviceFinger("2019", osversion);
			joinDeviceFinger("2020", oslanguage);

		}
		//获取当前设备位置信息

		mapUtil.getCurrentPosition(function(data) {
			var longitude = data.longitude,
				latitude = data.latitude;
			joinCoords(latitude, longitude);
		});

		//		plus.geolocation.getCurrentPosition(function(p) {
		//			var latitude = p.coords.latitude,
		//				longitude = p.coords.longitude;
		//			joinCoords(latitude, longitude);
		//		}, function(e) {
		//			joinCoords();
		//		}, {
		//			geocode: false,
		//			provider: "system"
		//		});

		local.setItem("deviceFinger", deviceFinger);

	};

	return returnResult;
})(mui);