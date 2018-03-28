/**
 * HTTP请求操作
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = (function($) {
	var returnResult = {},
		stringUtil = require("./string_util"),
		constant = require("./config/constant");

	require("./window_expansion");

	/**
	 * 创建公共请求参数
	 * @param {Object} pdata
	 */
	returnResult.createCommonParam = function(pdata) {
		var newPdata = {},
			paraArray = new Array();

		var token = pdata.token || local.getItem("token"),
			md5key = pdata.md5key || local.getItem("md5key") || "",
			clientId = pdata.clientId || local.getItem("clientId"), //个推clientId
			deviceType = pdata.deviceType || $.os.wechat ? 3 : $.os.ios ? 2 : $.os.android ? 1 : 4, //1-安卓，2-ios,3-微信,4-其它
			terminalType = pdata.terminalType || ($.os.ios || $.os.android) ? "M" : "P";
		newPdata.appVersion = constant.appVersion;
		if(!stringUtil.isEmpty(token)) {
			newPdata.token = token;
		}

		if(!stringUtil.isEmpty(terminalType)) {
			newPdata.terminalType = terminalType;
		}

		if(!stringUtil.isEmpty(clientId)) {
			newPdata.clientId = clientId;
		}

		if(!stringUtil.isEmpty(deviceType)) {
			newPdata.deviceType = deviceType;
		}

		for(var p in pdata) {
			if(typeof(pdata[p]) !== "function") {
				var key = p,
					value = pdata[p];

				if(!stringUtil.isEmpty(value)) {
					newPdata[key] = value;
				}

			}
		}

		//遍历传递参数
		for(var p in newPdata) {
			if(typeof(newPdata[p]) !== "function") {
				var key = p,
					value = newPdata[p];

				if(!stringUtil.isEmpty(value)) {
					paraArray.push(key);
				}

			}
		}

		//对参加排序并加密
		paraArray.sort();
		var paraStr = '',
			paraArrayLen = paraArray.length;
		for(var i = 0; i < paraArrayLen; i++) {
			var arrayItem = paraArray[i];
			paraStr += arrayItem.concat("=").concat(newPdata[arrayItem]);
		}

		paraStr = paraStr.concat("key=").concat(md5key);
		newPdata.sign = require("./crypto").md5(paraStr).toString();

		return newPdata;
	};

	/**
	 * 
	 * @param {Object} method:xxxxxx.do或http://xxx.xxx.xxx/xxx.do
	 * @param {Object} pdata:传参jsonobject
	 * @param {Object} success:请求成功回调方法名
	 * @param {Object} fail:请求失败回调方法名
	 * @param {Object} _options
	 */
	window.postData = function(method, pdata, success, fail, options) {

		if(stringUtil.isEmpty(method)) {
			$.toast("请求URL为空");
			return;
		}

		var _options = $.extend({
				showWait: true, //是否显示等待框,默认显示
				errorToast: true, //是否弹出错误提示,默认弹出
				autoCloseWait: true, //是否自动关闭等待圈
				timeout: 60000, //单位MS
				requestType: "post",
				dataType: "json",
				localResource: false,
				//				xhrFields: {
				//					withCredentials: true //发送凭证请求（HTTP Cookies和验证信息）
				//				},
				autoUpdateToken: 0, //是否自动更新TOKEN，0表示更新
				autoLogin: 0, //是否自动跳转至登录页,默认0表示跳转
				riskAgentFunc: null, //请求被风控拦回时的回调函数代理
				riskAgentSmsValidate: true //请求被风控拦回时是否需要验证短信
			}, options),
			logRandomId = stringUtil.randomString(32),
			requestHttpUrl = "";

		if(_options.localResource) {
			//请求本地资源
			requestHttpUrl = method.indexOf(constant.base) != -1 ? method : constant.base.concat(method);
		} else {
			if(stringUtil.isURL(method)) {
				requestHttpUrl = method;
			} else {
				if(method.indexOf("jst-finance-cashdeskfront") != -1) {
					//请求收银台前置系统
					requestHttpUrl = constant.payBeforeHttpServer.concat(method);
				} else if(method.indexOf("jst-park-app") != -1) {
					//请求城市停车接口
					requestHttpUrl = constant.smartParkHttpServer.concat(method);

				} else {
					//暂定默认请求APP前置系统
					requestHttpUrl = constant.httpServer.concat(method);
				}
			}
		}

		_options.showWait && showWaiting();
		var newParam = returnResult.createCommonParam(pdata);

		var failFunc = function(fail, msg, reponseData) {
			_options.autoCloseWait && closeWaiting();
			$.isFunction(fail) && fail(reponseData);
			//			if("abort" == type) {
			//				//用户中止了AJAX请求
			//				return;
			//			}

			_options.errorToast && $.toast(msg || "网络错误,请检查网络");

		};

		var successFunc = function(response, success) {
			_options.autoCloseWait && closeWaiting();
			//服务器返回响应，根据响应结果
			console.log(logRandomId + "--result-->" + JSON.stringify(response));

			if(response && $.isFunction(success)) {

				//统一处理TOKEN是否有效
				if(requestHttpUrl.indexOf("app/rest/member/login") == -1 && ("09" == response.resType || "08" == response.resType)) {

					if(stringUtil.isEmpty(login.getLoginParameter("loginParameter"))) {
						require("./common_util").preventAccess();
						return;
					}

					var updateTokenfail = function() {
						if(0 == _options.autoLogin) {
							login.logout(true);
						}
						$.isFunction(fail) && fail();
					};

					if(_options.autoUpdateToken != 0) {
						updateTokenfail();
					} else {
						//TOKEN不对，检查是否登录了，如果登录了则更新TOKEN
						returnResult.updateToken(function(token) {
							//更新TOKEN成功了，重新发送请求

							pdata.token = token;

							postData(method, pdata, success, fail, options);
						}, function() {
							//更新TOKEN失败了，跳至登录页
							updateTokenfail();
						});
					}

					return;
				}

				if("01" == response.resType) {
					//风控系统拦截
					var resCode = response.resCode,
						splitCode = '',
						flag = "";
					try {
						splitCode = resCode.slice(0, 4);
						flag = resCode.slice(5);
					} catch(e) {
						//TODO handle the exception
					}

					if("PS04" == splitCode) {
						returnResult.validateSms(flag, pdata, {
							riskAgentSmsValidate: _options.riskAgentSmsValidate,
							riskAgentFunc: _options.riskAgentFunc,
							successCallback: function() {
								postData(method, pdata, success, fail, options);
							},
							responseData: response
						});
						return;
					}

				}

				if(method.indexOf("jst-park-app") != -1) {
					//城市停车接口，还需另外判断返回码为200,才表示成功
					if("200" == response.code) {
						success(response);
					} else {
						failFunc(fail, response.msg, response);
					}
					return;
				}

				success(response);

			} else {
				failFunc(fail, "加载数据出错,请重试")
			}

		};

		console.log(logRandomId + "--reuqest-->url: " + requestHttpUrl + ",param: " + JSON.stringify(newParam));

		var ajaxSet = {
			headers: {
				"SESSIONNO": pdata.token || local.getItem("token"),
				"token": pdata.token || local.getItem("token")
			},
			data: newParam,
			dataType: _options.dataType, //服务器返回json格式数据
			type: _options.requestType, //HTTP请求类型
			timeout: _options.timeout, //超时时间
			success: function(data) {
				successFunc(data, success);
			},
			error: function(xhr, type, errorThrown) {
				failFunc(fail);
			}
		}
		if(requestHttpUrl.indexOf("app/rest/loan/front") != -1 || method.indexOf("jst-park-app") != -1) {
			//小贷系统+城市停车 接口都为JSON请求
			_options.contentType = "application/json";
		}

		if(!stringUtil.isEmpty(_options.contentType)) {
			ajaxSet.contentType = _options.contentType;
		}

		if(!stringUtil.isEmpty(_options.xhrFields)) {
			ajaxSet.xhrFields = _options.xhrFields;
		}

		$.ajax(requestHttpUrl, ajaxSet);

	};

	/**
	 * 更新TOKEN
	 * @param {Object} successCallback：成功回调
	 * @param {Object} failCallback:失败回调
	 */
	returnResult.updateToken = function(successCallback, failCallback) {
		var loginParameter = login.getLoginParameter("loginParameter");
		if(!login.isLogin() || !loginParameter) {
			//如果没有获取到登录信息，则直接失败
			failCallback && failCallback();
			return;
		}

		postData("app/rest/member/login", {
			mobile: loginParameter.userName,
			password: loginParameter.pwd
		}, function(data) {
			var token = data.token || "",
				key = data.key;
			if(data.resType == "00" && !stringUtil.isEmpty(token) && !stringUtil.isEmpty(key)) {

				local.setItem("token", token);
				local.setItem("md5key", key);
				successCallback && successCallback(token);

			} else {
				failCallback && failCallback();
			}

		}, function() {
			failCallback && failCallback();
		});
	};

	/**
	 * 验证短信
	 * @param {Object} pdata：验证之前的接口请求数据
	 * @param {Object} successCallback： 验证成功之后的回调
	 */
	returnResult.validateSms = function(flag, pdata, option) {
		//调出短信验证码输入界面

		var _option = $.extend({
				riskAgentFunc: null, //请求被风控拦回时的回调函数代理
				riskAgentSmsValidate: true, //请求被风控拦回时是否需要验证短信
				responseData: {}
			}, option),
			mobile = "", //接收短信的手机号
			rkey = "", //获取短信验证码跟踪码
			smsInput = require("./popup_sms_input");
		if(login.isLogin()) {
			mobile = login.getUserInfo().mobile;
		} else {
			mobile = pdata.mobile;
		}

		if(stringUtil.isEmpty(mobile)) {
			return;
		}

		/**
		 * 获取短信验证码
		 * @param {Object} element:获取短信验证码铵钮
		 */
		var getSmsCode = function(element) {

			//调用接口发送短信
			postData("app/rest/message/msgSend", {
				flag: flag || "",
				mobile: mobile
			}, function(res) {
				if(res.resType == "00") {
					rkey = res.rkey; //短信跟踪码
					element && require("./common_util").timeDown(element);
				} else {
					$.toast(res.msgContent);
				}
			}, null, {
				requestType: "get"
			});

		};

		var validateSmsCallback = function(smsCode) {
			if(stringUtil.isEmpty(smsCode)) {
				$.toast("短信验证码为空");
				return;
			}

			if(stringUtil.isEmpty(rkey)) {
				$.toast("请先获取短信验证码");
				return;
			}

			if(_option.riskAgentSmsValidate) {
				//请求验证短信验证码是否正确
				postData("app/rest/message/msgVerify", {
					flag: flag || "",
					mobile: mobile,
					verifyNum: smsCode,
					rkey: rkey
				}, function(res) {
					//判断是否验证成功了
					if(res.resCode == "0000") {
						//验证成功了，继续调用短信输入之前的接口
						if(_option.riskAgentFunc && typeof(_option.riskAgentFunc) == "function") {
							_option.responseData.rkey = rkey;
							_option.responseData.smsCode = smsCode;
							_option.riskAgentFunc(_option.responseData);
						} else {
							_option.successCallback && _option.successCallback();
						}
						smsInput.hide();
					} else {
						$.toast(res.msgContent);
					}
				}, null, {
					requestType: "get"
				});
			} else {
				if(_option.riskAgentFunc && typeof(_option.riskAgentFunc) == "function") {
					_option.responseData.rkey = rkey;
					_option.responseData.smsCode = smsCode;
					_option.responseData.smsInput = smsInput;
					_option.riskAgentFunc(_option.responseData);
				}
			}

		};
		getSmsCode();
		smsInput.show({
			withInit: true, //是否直接初始化并显示，如设置为FALSE，请先调用init 
			smsSended: true, //是否已经发送短信
			mobile: mobile, //要获取短信的手机号
			getCodeCallback: getSmsCode, //获取验证码回调
			doneCallback: validateSmsCallback //输完后的回调
		});
	};

	return returnResult;
})(mui);