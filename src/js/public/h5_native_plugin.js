/**
 * H5和原生APP交互
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = (function($) {
	$.plusReady(function() {
		var _BARCODE = 'plugintest',
			B = window.plus.bridge;
		window.plus.callnative = {
			/**
			 * JS传递消息给原生APP对象
			 * @param {Object} argus：参数JSONOBJECT
			 * @param {Object} successCallback:成功回调
			 * @param {Object} errorCallback：失败回调
			 */
			PluginTestFunction: function(argus, successCallback, errorCallback) {
				var success = typeof successCallback !== 'function' ? null : function(args) {

						if(args && args[0]) {
							successCallback(JSON.parse(args[0]));
						}

					},
					fail = typeof errorCallback !== 'function' ? null : function(code) {
						errorCallback(code);
					};
				callbackID = B.callbackId(success, fail);

				return B.exec(_BARCODE, "PluginTestFunction", [callbackID, JSON.stringify(argus)]);
			}
		};
	});

	var returnResult = {}; //返回对象

	/**
	 * 推送信息
	 */
	returnResult.push = {
		/**
		 * 获取推送唯一标识
		 */
		getClientid: function() {
			return($.os.plus && window.plus) ? plus.push.getClientInfo().clientid : ""
		}
	};

	/**
	 * 地理位置，导航等
	 */
	returnResult.map = {
		/**
		 * 获取设备当前位置
		 */
		getCurrentPosition: function(callback, args) {
			returnResult.callnative.invokeNative(
				$.extend({
					type: 1
				}, args),
				function(res) {

					var longitude = 0,
						latitude = 0;
					try {
						var data = res.data;
						longitude = data.longitude;
						latitude = data.latitude;

					} catch(e) {
						//TODO handle the exception
					}

					if(longitude > 0 && latitude > 0) {
						//获取到地理位置了
						callback && callback(data);
					}
				},
				function(code) {});
		},
		/**
			 * 调起地图导航
			 * @param {Object} start:{//导航起点
		            longitude:100.12556,//经度
		            latitude:20.7894,//纬度
		            address:"xxxxxxxx"//起点地址
		        },
			 * @param {Object} end:{//导航终点
		            longitude:100.12556,//经度
		            latitude:20.7894,//纬度
		            address:"xxxxxxxx"//终点地址
		        }
			 */
		callMapNav: function(args) {
			returnResult.callnative.invokeNative(args, function(res) {}, function(code) {});
		},

		/**
		 * 创建地点对象
		 * @param {Object} longitude
		 * @param {Object} latitude
		 * @param {Object} address
		 */
		createPosition: function(longitude, latitude, address) {
			var obj = new Object();
			obj.longitude = longitude;
			obj.latitude = latitude;
			obj.address = address;
			return obj;
		}
	};

	/**
	 * JS调用原生方法
	 */
	returnResult.callnative = {
		/**
		 * 
		 * @param {Object} argus：参数jsonobject
		 * @param {Object} successCallback:成功回调
		 * @param {Object} errorCallback:失败回调
		 */
		invokeNative: function(argus, successCallback, errorCallback) {
			var type = 0,
				callby = ""; //这个参数是为了区别停车场详情调用页的方式，由于IOS端WEBVIEW被DCLOUD代理，因此调用方法要特别区分
			try {
				type = argus.type;
				callby = argus.callby;
			} catch(e) {
				//TODO handle the exception
			}

			switch(type) {
				case 16:
					//关闭WEBAPP之前，先清除启动标识
					local.removeItem("runtime");
					break;
				default:
					break;
			}

			/**
			 * 成功回调
			 * @param {Object} _dataObj
			 */
			var _success = function(_dataObj) {
				if(8 == type) {
					//调用支付时，可能是选择捷易付，如果在捷易付里设置了支付密码&绑卡等操作，则要更新缓存里的用户信息啊
					setTimeout(function() {
						login.updateUserInfo();
					}, 200);
				}
				successCallback && successCallback(_dataObj);
			};

			/**
			 * 提供给NATIVE调用
			 * @param {Object} data
			 */
			window.invokeJS = function(data) {
				try {
					var dataObj = typeof(data) != "object" ? JSON.parse(data) : data;
					_success(dataObj);
				} catch(e) {
					errorCallback && errorCallback();
				}
			};
			if(window.webview && 9 == type) {
				window.webview.closeFromJs();
			} else if("native" == callby) {
				//车场详情页IOS交互
				window.webkit.messageHandlers.invokeNative.postMessage(JSON.stringify(argus));
			} else {
				plus.callnative.PluginTestFunction(argus, _success, errorCallback);
			}

		}
	}

	return returnResult;
})(mui);