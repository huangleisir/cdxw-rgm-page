/**
 * 公共引用，JS模块或入口都依赖此文件，涉及到大部分页面需用到
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */

require("./mui_expansion");

//常量定义
window.constant = require("./config/constant");

//字符串工具
window.stringUtil = require("./string_util");

//URL常用方法
window.requestURL = require("./requestURL");

//存储
window.local = require("./localStorage");

//自定义窗口方法扩展
window.winExp = require("./window_expansion");

//HTTP请求操作
window.httpClient = require("./http_client");

//登录信息设置获取
window.login = require("./login_module");

//初始化JS-native插件
require("./h5_native_plugin");

/**
 * 加载执行，初始化等
 * @param {Object} $
 */
(function($) {
	var self = {},

		//设置页面HTML属性fontsize
		setFontsize = function() {
			var docEl = document.documentElement,
				clientWidth = docEl.clientWidth;
			if(!clientWidth) return;
			var fontsize = Math.min(clientWidth, 640) / 16;
			docEl.style.fontSize = this.fontSize = fontsize + 'px';
			docEl.setAttribute('fontsize', fontsize);
		},

		//加载weixin脚本
		initWxscript = function() {
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "http://res.wx.qq.com/open/js/jweixin-1.0.0.js"; //最新是1.2.0
			document.getElementsByTagName("head")[0].appendChild(script);

			if("ZHTC" == constant.templetStyle) {
				//目前仅停车需要处理下头部隐藏
				var weixinHeaderFilter = require("./config/app_page_config").weixinHeaderFilter;
				window.needHeaderHidden = true; //是否需要隐藏头部
				for(var key in weixinHeaderFilter) {
					var filterPage = weixinHeaderFilter[key];
					if(location.href.indexOf(filterPage) != -1) {
						window.needHeaderHidden = false;
						break;
					}
				}

				if(window.needHeaderHidden) {
					$(".header").addClass("mui-hidden");
					$(".mui-content").css("padding-top", "0");
					$(".mui-view .mui-navbar").css("height", "0");
					$(".mui-view .mui-pages").css("top", "0");
				}
			}

		},

		_initAccessData = function(callback) {
			var md5key = '',
				token = '',
				selTokenData = '',
				access = requestURL.getParameter("access"),
				openId = requestURL.getParameter("openId"), //微信环境下获取OPENID
				_beforeCallback = function() {
					if(!stringUtil.isEmpty(md5key) && !stringUtil.isEmpty(token)) {
						local.setItem("selTokenData", selTokenData);
						local.setItem("md5key", md5key);
						local.setItem("token", token);
						local.setItem("access", access);
						if(!stringUtil.isEmpty(openId)) {
							sessionStorage.setItem("openId", openId);
						}
						callback && callback();
					} else {
						//没有获取到KEY值，非法访问
						require("./common_util").preventAccess(1);
					}
				};

			if(!stringUtil.isEmpty(access) && access != local.getItem("access")) {
				postData("app/rest/member/selToken", {
					access: access
				}, function(res) {
					selTokenData = JSON.stringify(res);
					token = res.token;
					md5key = res.key;
					_beforeCallback();
				}, function() {
					require("./common_util").preventAccess(1);
				});
			} else {
				token = local.getItem("token");
				md5key = local.getItem("md5key");
				selTokenData = local.getItem("selTokenData");

				//																postData("app/rest/member/login", {
				//																	mobile: "18825265187",
				//																	password: require("./crypto").encryptPwd("li527241"),
				//																	deviceFinger: local.getItem("deviceFinger")
				//																}, function(data) {
				//																	var _token = data.token || "",
				//																		_appKey = data.appKey || "";
				//																	if(data.resType == "00") {
				//																		if(stringUtil.isEmpty(_token) || stringUtil.isEmpty(_appKey)) {
				//																			$.toast("登录出错啦,获取TOKEN|key为空");
				//																			return;
				//																		}
				//																		md5key = _appKey;
				//																		token = _token;
				//																		selTokenData = JSON.stringify({
				//																			merchantName: "MAX测试",
				//																			amount: 666
				//																		});
				//																		_beforeCallback();
				//																	} else {
				//												
				//																		$.toast(data.msgContent);
				//												
				//																	}
				//												
				//																});

				_beforeCallback();
			}
		},

		/**
		 * 获取支付信息
		 * @param {Object} callback
		 */
		_initPrepayInfo = function(callback) {
			var md5key = '',
				token = '',
				prepayJson = '',
				_beforeCallback = function() {
					if(!stringUtil.isEmpty(md5key) && !stringUtil.isEmpty(token) && !stringUtil.isEmpty(prepayJson)) {
						local.setItem("md5key", md5key);
						local.setItem("token", token);
						local.setItem("prepayJson", prepayJson);
						callback && callback();
					} else {
						//没有获取到KEY值，非法访问
						require("./common_util").preventAccess(2);
					}
				};

			var prePayId = requestURL.getParameter("prePayId");
			if(!stringUtil.isEmpty(prePayId)) {
				postData("jst-finance-cashdeskfront/pay/getPrePayIdInfo.do", {
					prePayId: prePayId
				}, function(res) {

					if("00" == res.resType) {
						var resultData = res.result;
						token = resultData.token;
						md5key = resultData.key;
						prepayJson = JSON.stringify(resultData);
						local.setItem("prePayId", prePayId);

					} else {
						$.toast(res.message);
					}
					_beforeCallback();
				});
			} else {
				token = local.getItem("token");
				md5key = local.getItem("md5key");
				prepayJson = local.getItem("prepayJson");
				_beforeCallback();
			}

		},

		/**
		 * 获取停车微信公众号OPENID
		 * @param {Object} callback
		 */
		_initSmartparkData = function(callback) {
			var md5key = '',
				token = '',
				openId = requestURL.getParameter("openId"),
				tradeKey = requestURL.getParameter("tradeKey"),
				fromLocal = false,
				_beforeCallback = function() {
					if(!stringUtil.isEmpty(md5key) && !stringUtil.isEmpty(token)) {
						local.setItem("md5key", md5key);
						local.setItem("token", token);
						sessionStorage.setItem("openId", openId);
						sessionStorage.setItem("tradeKey", tradeKey);
						callback && callback();
					} else {
						//没有获取到KEY值，非法访问
						var errorPage = "smartpark/error/smartpark_error.html";
						//						openWindow(errorPage);
					}
				};

			if(stringUtil.isEmpty(openId) || stringUtil.isEmpty(tradeKey)) {
				openId = sessionStorage.getItem("openId");
				tradeKey = sessionStorage.getItem("tradeKey");
				fromLocal = true;
			}

			if(!stringUtil.isEmpty(openId) && !stringUtil.isEmpty(tradeKey)) {

				if(fromLocal) {
					//当链接后面不带OPENID时，说明不是从微信公众号菜单入口文件进入，需要优先从缓存里读取数据，
					token = local.getItem("token");
					md5key = local.getItem("md5key");
				}

				if(!stringUtil.isEmpty(md5key) && !stringUtil.isEmpty(token)) {
					_beforeCallback();
					return;
				}

				//获取用户TOKEN
				postData("jst-park-app/member/getToken", {
					openId: openId,
					tradeKey: tradeKey
				}, function(res) {
					var resultData = res.data;
					token = resultData.token;
					md5key = resultData.appKey;
					_beforeCallback();
				}, function(res) {
					if("MB00038" == res.code) {
						//唉呀，没有绑定手机号呢，
						var bindPage = "smartpark/user/weixin_binding.html";
						openWindow(bindPage, bindPage, {
							openId: openId,
							tradeKey: tradeKey,
							forwardUrl: requestURL.createURL(location.href, {
								openId: openId,
								tradeKey: tradeKey
							})
						});
						return;
					}

					_beforeCallback();

				}, {
					errorToast: false
				});
			} else {
				_beforeCallback();
			}

		},

		//初始化执行
		_init = function() {
			setFontsize();
			if($.os.wechat) {
				initWxscript();
			}
		};
	_init();

	$.initComplete = function(callback) {

		var _callback = function() {
			if("cashdesk" == constant.appName) {
				_initPrepayInfo(callback);
			} else if("account" == constant.appName) {
				_initAccessData(callback);
			} else if("weixin_smartpark" == constant.appName) {
				_initSmartparkData(callback);
			} else {
				callback && callback();
			}
		};

		if("app" == constant.appName && $.os.plus) {
			//APP环境，设置TOKEN缓存
			$.plusReady(function() {
				//根据DEBUG选择的环境切换连接IP
				if("remote" != plus.storage.getItem("AppLanuchFile")) {
					constant.httpServer = plus.storage.getItem("httpServer") || constant.httpServer;
					constant.cashCenterHttpServer = plus.storage.getItem("cashCenterHttpServer") || constant.cashCenterHttpServer;
					constant.payBeforeHttpServer = plus.storage.getItem("payBeforeHttpServer") || constant.payBeforeHttpServer;
					constant.smartParkHttpServer = plus.storage.getItem("smartParkHttpServer") || constant.smartParkHttpServer;

				}
				_callback();
			});
		} else {
			$.ready(function() {
				_callback();
			});
		}

	}

})(mui);