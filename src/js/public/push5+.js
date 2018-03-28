/**
 * 推送
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = (function($) {

	return {
		init: function() {
			var _self = this;
			$.plusReady(function() {

				console.log("begin push init");

				// 监听点击消息事件
				plus.push.addEventListener("click", function(msg) {
					// 判断是从本地创建还是离线推送的消息
					switch(msg.payload) {
						case "LocalMSG":
//							$.toast("点击本地创建消息启动：");
							break;
						default:
//							$.toast("点击离线推送消息启动：");
							break;
					}
					// 提示点击的内容
					plus.nativeUI.alert(msg.content);
					// 处理其它数据
					_self.handlePush(msg);
				}, false);
				// 监听在线消息事件
				plus.push.addEventListener("receive", function(msg) {
					if(msg.aps) { // Apple APNS message
//						$.toast("接收到在线APNS消息：");
					} else {
//						$.toast("接收到在线透传消息：");
					}
					_self.handlePush(msg);
				}, false);

				_self.getPushInfo();
			});
		},
		getPushInfo: function() {
			var info = plus.push.getClientInfo();
//			$.alert("获取客户端推送标识信息：" + JSON.stringify(info));
		},

		handlePush: function(msg) {

//			$.alert("接收消息内容:" + JSON.stringify(msg));

			var handler = {
				/**
				 * 刷新停车状态数据，涉及到的页面为当前应用显示栈顶的WebviewObject窗口对象、首页
				 * @param {Object} orderId
				 */
				refreshParkStatus: function(orderId) {

					var lanuchWeb = require("./webview_opr").getLaunchWebview(),
						topWeb = plus.webview.getTopWebview();

					$.fire(lanuchWeb, "refreshData");

					var topUrl = topWeb.getURL();

					if(topUrl.indexOf("smartpark/car/park_stop.html") != -1 || topUrl.indexOf("smartpark/car/road_stop.html") != -1 || topUrl.indexOf("smartpark/car/park_detail.html") != -1) {
						$.fire(topWeb, "refreshData", {
							orderId: orderId
						});
					}

				}
			};

			var content = msg.content;
			if(!stringUtil.isEmpty(content)) {
				try {
					
					content = JSON.parse(content);
					
					var msgCode = content.msgCode,
						msgData = content.msgData,
						msgContent = content.msgContent;

					switch(msgCode) {
						case "5999":
							//普通弹窗通知
							if(stringUtil.isEmpty(msgContent)) {
								return;
							}
							plus.nativeUI.alert(msgContent);

							break;

						case "6001": //入场
						case "6002": //准备超时
						case "6003": //已超时
						case "6004": //离场

							if(typeof(msgData) != "object") {
								msgData = JSON.parse(msgData);
							}

							var orderId = msgData.orderId; //订单号
							handler.refreshParkStatus(orderId);
							break;
						default:
							break;
					}

				} catch(e) {
					//TODO handle the exception
				}
			}
		}
	};

})(mui);