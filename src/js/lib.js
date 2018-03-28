// 公共参数

window.serverIp = "http://10.101.130.8:9211/"; // APP前置 https://app.jieshunpay.cn/ http://testjsjk.jieshunpay.cn:18114/
window.serverJsjk = "http://14.215.135.114:8000/"; // 官网新闻 http://10.101.90.59/ http://www.jsfintech.cn/
window.smartParkHttpServer = "https://app.jieshunpay.cn/"; //停车前置 http://jsjktest.jieshunpay.cn:18278/ https://app.jieshunpay.cn/

window.stringModule = {};
window.httpModule = {};
window.sessionModule = {};
window.dateModule = {};
window.timeId_code = ""; //发送验证码定时器ID
/**
 * 判断是否为空
 * 有值返回ture，否则返回false
 */
stringModule.CheckEmpty = function(str) {
	if(str != "" && str != null && str != undefined) {
		return true;
	} else if(str == 0 && typeof(str) == "number") {
		return true;
	} else {
		return false;
	}
}

// 获取相应的正则表达式
stringModule.regexpRule = function(type, str, tips) {
	//	str = parseInt(str)
	var checkRes = {};
	var checkTips = "ok";
	switch(type) {
		case "number":
			console.log("aaa");
			checkTips = /^\d+$/.test(str) ? checkTips : tips; // /^\d+$/
			checkRes = {
				result: /^\d+$/.test(str),
				warn: checkTips
			};
			break;
		case "must":
			checkTips = /^\S+$/.test(str) ? checkTips : tips;
			checkRes = {
				result: /^\S+$/.test(str),
				warn: checkTips
			};
			break;
		case "mobile":
			checkTips = /^1[3|4|5|7|8|9]\d{9}$/.test(str) ? checkTips : tips;
			checkRes = {
				result: /^1[3|4|5|7|8|9]\d{9}$/.test(str),
				warn: checkTips
			};
			break;
		case "email":
			checkTips = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(str) ? checkTips : tips;
			checkRes = {
				result: /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(str),
				warn: checkTips
			};
			break;
		case "license":
			var licRes = stringModule.checkLicenceCode(str);
			checkRes = {
				result: licRes.res,
				warn: licRes.msg
			};
			break;
		case "orgcode":
			var orgRes = stringModule.checkOrgCode(str);
			checkRes = {
				result: orgRes.res,
				warn: orgRes.msg
			};
			break;
		case "bankcode":
			checkTips = /^[0-9]{15,30}$/.test(str) ? checkTips : tips;
			checkRes = {
				result: /^[0-9]{15,30}$/.test(str),
				warn: checkTips
			};
			break;
		case "ident":
			var ideRes = stringModule.identityCodeValid(str);
			checkRes = {
				result: ideRes.res,
				warn: ideRes.msg
			};
			break;
		case "name":
			checkTips = /^[\u4e00-\u9fa5]+$/.test(str) ? checkTips : tips;
			checkRes = {
				result: /^[\u4e00-\u9fa5]+$/.test(str),
				warn: checkTips
			};
			break;
		case "cycle":
			checkTips = /0|(^[1-9]+\d*$)/.test(str) ? checkTips : tips; // /^\d+$/
			checkRes = {
				result: /0|(^[1-9]+\d*$)/.test(str),
				warn: checkTips
			};
			break;
	}
	return checkRes;
}
// 判断是否为营业执照编号
stringModule.checkLicenceCode = function(busCode) { // 430100400007489
	var ret = false;
	if(busCode.length == 15) {
		var sum = 0;
		var s = [];
		var p = [];
		var a = [];
		var m = 10;
		p[0] = m;
		for(var i = 0; i < busCode.length; i++) {
			a[i] = parseInt(busCode.substring(i, i + 1), m);
			s[i] = (p[i] % (m + 1)) + a[i];
			if(0 == s[i] % m) {
				p[i + 1] = 10 * 2;
			} else {
				p[i + 1] = (s[i] % m) * 2;
			}
		}
		if(1 == (s[14] % m)) {
			ret = {
				res: true,
				msg: "ok"
			}; // 营业执照编号正确!
		} else {
			ret = {
				res: false,
				msg: "请输入正确的营业执照编号"
			};
		}
	} else if(busCode == "") {
		ret = {
			res: false,
			msg: "请输入正确的营业执照编号"
		}; // 营业执照编号不能为空
	} else {
		ret = {
			res: false,
			msg: "营业执照号须为15位数字组成"
		};
	}
	return ret;
}
// 判断校验组织机构代码
stringModule.checkOrgCode = function(orgCode) {
	// 05230317-7 X3203231-4
	var ret = false;
	var codeVal = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
	var intVal = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];
	var crcs = [3, 7, 9, 10, 5, 8, 4, 2];
	if(!("" == orgCode) && orgCode.length == 10) {
		var sum = 0;
		for(var i = 0; i < 8; i++) {
			var codeI = orgCode.substring(i, i + 1);
			var valI = -1;
			for(var j = 0; j < codeVal.length; j++) {
				if(codeI == codeVal[j]) {
					valI = intVal[j];
					break;
				}
			}
			sum += valI * crcs[i];
		}
		var crc = 11 - (sum % 11);

		switch(crc) {
			case 10:
				{
					crc = "X";
					break;
				}
			default:
				{
					break;
				}
		}
		if(crc == orgCode.substring(9)) {
			ret = {
				res: true,
				msg: "ok"
			};
		} else {
			ret = {
				res: false,
				msg: "请输入正确的组织机构代码"
			};
		}
	} else if(orgCode == "") {
		ret = {
			res: false,
			msg: "请输入正确的组织机构代码"
		};
	} else {
		ret = {
			res: false,
			msg: "请输入正确的组织机构代码"
		}; //格式不正确，组织机构代码为8位数字或者拉丁字母+“-”+1位校验码，并且字母必须大写
	}
	return ret;
}

// 身份证号码验证
stringModule.identityCodeValid = function(code) {
	var city = {
		11: "北京",
		12: "天津",
		13: "河北",
		14: "山西",
		15: "内蒙古",
		21: "辽宁",
		22: "吉林",
		23: "黑龙江 ",
		31: "上海",
		32: "江苏",
		33: "浙江",
		34: "安徽",
		35: "福建",
		36: "江西",
		37: "山东",
		41: "河南",
		42: "湖北 ",
		43: "湖南",
		44: "广东",
		45: "广西",
		46: "海南",
		50: "重庆",
		51: "四川",
		52: "贵州",
		53: "云南",
		54: "西藏 ",
		61: "陕西",
		62: "甘肃",
		63: "青海",
		64: "宁夏",
		65: "新疆",
		71: "台湾",
		81: "香港",
		82: "澳门",
		91: "国外 "
	};
	var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]; //加权因子
	var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2]; //校验位
	var pass = {
		res: true,
		msg: "ok"
	};
	if(code.length == 15) {
		code = code.substring(0, 6) + "19" + code.substring(6, 15);
		var ocode = code.split('');
		var osum = 0;
		for(var i = 0; i < 17; i++) {
			osum += ocode[i] * factor[i];
		}
		code = code + (parity[osum % 11]).toString();
	}
	if(!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
		pass = {
			res: false,
			msg: "请输入正确的身份证号码"
		}; // 身份证号格式错误
	} else if(!city[code.substr(0, 2)]) {
		pass = {
			res: false,
			msg: "请输入正确的身份证号码"
		}; // 地址编码错误
	} else {
		//18位身份证需要验证最后一位校验位
		if(code.length == 18) {
			code = code.split('');
			var sum = 0;
			for(var i = 0; i < 17; i++) {
				sum += code[i] * factor[i];
			}
			if(parity[sum % 11] != code[17]) {
				pass = {
					res: false,
					msg: "请输入正确的身份证号码"
				}; // 校验位错误
			}
		}
	}
	return pass;
}

// 时间显示格式化
dateModule.formatDate = function(oDate, sFormation) {
	var obj = {
		yyyy: oDate.getFullYear(),
		yy: ("" + oDate.getFullYear()).slice(-2),
		M: oDate.getMonth() + 1,
		MM: ("0" + (oDate.getMonth() + 1)).slice(-2),
		d: oDate.getDate(),
		dd: ("0" + oDate.getDate()).slice(-2),
		H: oDate.getHours(),
		HH: ("0" + oDate.getHours()).slice(-2),
		h: oDate.getHours() % 12,
		hh: ("0" + oDate.getHours() % 12).slice(-2),
		m: oDate.getMinutes(),
		mm: ("0" + oDate.getMinutes()).slice(-2),
		s: oDate.getSeconds(),
		ss: ("0" + oDate.getSeconds()).slice(-2),
		w: ['日', '一', '二', '三', '四', '五', '六'][oDate.getDay()]
	};
	return sFormation.replace(/([a-z]+)/ig, function($1) {
		return obj[$1]
	});
}

// 计算未来N年的时间
dateModule.futureDate = function(n) {
	var result = new Date;
	result.setFullYear(result.getFullYear() + n);
	return result;
}

//阿拉伯数字转换中文
stringModule.convertToChinese = function(num) {
	var N = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
	var str = num.toString();
	var len = num.toString().length;
	var C_Num = [];
	for(var i = 0; i < len; i++) {
		C_Num.push(N[str.charAt(i)]);
	}
	return C_Num.join('');
}

/**
 * jQuery的ajax方法
 * 请求方式默认POST
 */
httpModule.ajaxRequest = function(res) {
	if(stringModule.CheckEmpty(res.name)) {
		var reqName = res.name; // 接口名称描述
	} else {
		var reqName = "";
	}
	var options = $.extend({
		headers: {},
		type: "POST",
		url: "http://" + location.hostname + "/",
		contentType: "application/x-www-form-urlencoded;charset=utf-8",
		data: {},
		dataType: "json",
		async: true,
		success: function() {},
		error: function(err) {
			console.log(reqName + " → " + "状态码：" + err.status + " " + "状态描述：" + err.statusText);
		},
		complete: function() {},
		xhrFields: {
			withCredentials: true
		}
	}, res);
	if(options.contentType == "application/json;charset=utf-8") {
		options.data = JSON.stringify(options.data);
	}
	$.ajax({
		headers: options.headers,
		type: options.type,
		url: res.url.indexOf("http") == -1 ? serverIp + options.url : res.url,
		contentType: options.contentType,
		xhrFields: options.xhrFields,
		async: options.async,
		data: options.data,
		dataType: options.dataType,
		success: options.success,
		error: options.error,
		complete: options.complete
	});

}

/**
 * 判断用户是否处于登陆状态
 * 不在登录状态下，进行提示并跳转到指定页面，默认是登陆页
 */
sessionModule.isLogin = function(str, tips, url) {
	var reqUrl = "../home/login.html";
	var tipsCon = "请先登录！";
	reqUrl = url == "" || url == null || url == undefined ? reqUrl : url;
	tipsCon = tips == "" || tips == null || url == undefined ? tipsCon : tips;
	if(!stringModule.CheckEmpty(str)) {
		//alert(tipsCon);
		sessionStorage.setItem("menuType", "99");
		window.location.href = reqUrl;
		return {
			msgtext: tipsCon,
			requrl: reqUrl
		};
	}
}

/*	方法：保留两位小数的金额输入
	参数：dom:dom节点---通过id获取
*/
function sumInput(dom) {
	var obj = document.getElementById(dom);
	var reg = /^\d+(\.\d{0,2})?$/g,
		moneyVal = obj.value;
	if(!reg.test(moneyVal)) {
		var _value = moneyVal.substr(0, moneyVal.length - 1);
		obj.value = _value
	}
}
//获取url的参数
stringModule.getUrlString = function(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r != null) {
		return decodeURI(r[2]);
	} else {
		return "";
	}
}
var exports = {
	//	key: "1010110202022030",
	//	iv: "1010110202022030",
	//	encrypt: function(word) {
	//
	//		if(stringUtil.isEmpty(word)) {
	//			return '';
	//		}
	//
	//		var key = CryptoJS.enc.Utf8.parse(this.key);
	//		var iv = CryptoJS.enc.Utf8.parse(this.iv);
	//		var srcs = CryptoJS.enc.Utf8.parse(word);
	//		var encrypted = CryptoJS.AES.encrypt(srcs, key, {
	//			iv: iv,
	//			mode: CryptoJS.mode.CBC
	//		});
	//		return encrypted.toString();
	//	},
	//
	//	decrypt: function(word) {
	//
	//		if(stringUtil.isEmpty(word)) {
	//			return '';
	//		}
	//		var key = CryptoJS.enc.Utf8.parse(this.key);
	//		var iv = CryptoJS.enc.Utf8.parse(this.iv);
	//		var decrypt = CryptoJS.AES.decrypt(word, key, {
	//			iv: iv,
	//			mode: CryptoJS.mode.CBC
	//		});
	//
	//		var retult = CryptoJS.enc.Utf8.stringify(decrypt).toString();
	//		return retult;
	//	},

	/**
	 * 将字符串转为MD5 Array ,如需字符串，请自行调用.toString
	 * @param {Object} word
	 */
	md5: function(word) {
		return CryptoJS.MD5(word);
	},

	/**
	 * 将array转为BASE64字符串
	 * @param {Object} wordArray
	 */
	base64: function(wordArray) {
		return CryptoJS.enc.Base64.stringify(wordArray);
	},

	/**
	 * 将密码先MD5,后BASE64
	 * @param {Object} pwd
	 */
	encryptPwd: function(pwd) {
		return this.md5(pwd).toString();
		//		return this.base64(this.md5(pwd));
	},

	/*弹框
	 obj:弹框内容父节点id名
	 alertTitle:弹框标题
	 alertContent:弹框内容
	 alertBtn:弹框按钮数组
	 alertWidth:弹框宽度
	 * */
	alertBox: function(obj, alertTitle, alertContent, alertBtn, alertWidth) {
		$.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
			_title: function(title) {
				var $title = this.options.title || '&nbsp;'
				if(("title_html" in this.options) && this.options.title_html == true)
					title.html($title);
				else title.text($title);
			}
		}));
		obj = "#" + obj;
		$(obj).html(alertContent);

		$(obj).removeClass('hide').dialog({
			resizable: false,
			width: alertWidth,
			modal: true,
			title: alertTitle,
			title_html: true,
			buttons: alertBtn
		});

	},
	//获取url的参数
	//	getUrlString: function(name) {
	//		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	//		var r = window.location.search.substr(1).match(reg);
	//		if(r != null) {
	//			return decodeURI(r[2]);
	//		} else {
	//			return "";
	//		}
	//	},
	//发送验证码弹框
	sendCodeBox: function(sendCodeBox, telNum, callback) {
		var self = this,
			rfKey = "",
			obj = sendCodeBox,
			alertTitle = '<h4 class="center alert-title">提示</h4>',
			alertContent = '<div class="alert-content">' +
			'<p>该笔交易需要进行短信验证</p>' +
			'<p>' + telNum.substring(0, 3) + '***' + telNum.substring(8) + '</p>' +
			'<input id="inputCode" type="text" class="sms-input"/>' +
			'<button id="sendCodeBtn" class="sms-btn">发送验证码</button>' +
			'<p id="smsErrTips" style="color:#f00;"></p>'
		'</div>',
		alertWidth = 400,
			alertBtn = [{
				html: "确认",
				"class": "alert-btn",
				click: function() {
					var $this = $(this);
					self.checkCode(rfKey, $("#inputCode").val(), function() { //校验成功回调
						clearInterval(timeId_code);
						$("#sendCodeBtn").removeClass("unable");
						$("#sendCodeBtn").text("发送验证码");
						callback();
						$this.dialog("close");
					}, function(err) { //检验失败回调
						$("#smsErrTips").text(err);
					});
					//								$this.dialog("close");									
				}
			}];
		self.alertBox(obj, alertTitle, alertContent, alertBtn, alertWidth);
		$("#inputCode").bind("input", function() {
			var realvalue = this.value.replace(/\D/g, "");
			$(this).val(realvalue);
		});
		$("#inputCode").bind("focus", function() {
			$("#smsErrTips").text("");
		});
		$("#sendCodeBtn").bind("click", function() {
			if($(this).hasClass("unable")) {
				return;
			}

			rfKey = self.getCode(telNum, "sendCodeBtn");

		})
	},
	/*
	 * 用途：获取验证码；
	 *参数：
	 * telNum：电话号码
	 * btnObj：发送验证码按钮的ID名；
	 * **/
	getCode: function(telNum, btnObj) {
		var codeKey = "",
			count = 60;
		httpModule.ajaxRequest({
			name: "获取验证码",
			type: "POST",
			async: true,
			url: "jst-finance-merchantFront/rest/merchantController/getMsgVerifyCode",
			data: {
				company_tel: telNum
			},
			success: function(data) {
				console.log(data);
				if(data.resType == "00") {
					codeKey = data.rfkey;
					timeId_code = setInterval(function() {
						$("#" + btnObj).addClass("unable");
						$("#" + btnObj).text(count + "s");
						count--;
						if(count <= 0) {
							count = 0;
							$("#" + btnObj).text("重新发送");
							$("#" + btnObj).removeClass("unable");
							clearInterval(timeId_code);
						}
					}, 1000)
				} else {
					alert(data.msgContent)
				}

			}
		});
		return codeKey;
	},
	//校验验证码rfkey--验证码密钥 ，msgCode--验证码值
	checkCode: function(rfKey, msgCode, fun1, fun2) {
		httpModule.ajaxRequest({
			name: "校验验证码",
			type: "POST",
			async: true,
			url: "jst-finance-merchantFront/rest/merchantController/matchMsgVerifyCode",
			data: {
				rfkey: rfKey,
				msgCode: msgCode
			},
			success: function(data) {
				if(data.resType == "00") {
					fun1();
				} else {
					fun2(data.msgContent);
				}
			}
		});
	},
	//金额输入格式化
	sumInputFormat: function(obj) {
		obj.value = obj.value.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
		obj.value = obj.value.replace(/^\./g, ""); //验证第一个字符是数字
		obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个, 清除多余的
		obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
		obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数
	}

};

/**
 * 登陆密码输入校验；
 * firstInputId：第一次密码输入框ID
 * secondInputId：第二次密码输入框ID
 * fun：回调函数
 * */
function loginPwdInput(firstInputId, secondInputId, fun) {
	var firstInputEle = $("#" + firstInputId),
		secondInputEle = $("#" + secondInputId),
		regLetter = /^[a-zA-Z]+$/,
		regNumber = /^[0-9]+$/,
		result = {
			msg: "",
			reg: false,
			pwd: "",
			firstResult: {
				msg: "",
				reg: false
			},
			secondResult: {
				msg: "",
				reg: false
			}
		};

	/*第一次密码输入*/
	firstInputEle.bind({
		"keyup": function() {
			var realvalue = this.value.replace(/\s+/g, "");
			$(this).val(realvalue);

			if(result.secondResult.reg) { //确认密码提填写且合法

				if(secondInputEle.val().length == $(this).val().length) { //两次密码长度一致
					if(secondInputEle.val() == $(this).val()) { //与确认密码一致
						result.msg = "两次密码输入一致";
						result.reg = true;
						result.pwd = $(this).val();
					} else {
						result.msg = "两次密码输入不一致";
						result.reg = false;
						result.pwd = "";
					}
				} else if(secondInputEle.val().length <= $(this).val().length) {
					result.msg = "两次密码输入不一致";
					result.reg = false;
					result.pwd = "";
				} else {
					result.msg = "";
					result.reg = false;
					result.pwd = "";
				}

			} else { //确认密码未填写，或者确认密码不合法

			}

			fun(result);

			//			console.log($(this).val())
		},
		"blur": function() {

			if(regLetter.test($(this).val())) { //密码全为字母，不合法

				result.firstResult.reg = false;
				result.firstResult.msg = "密码不能全为字母！";

			} else if(regNumber.test($(this).val())) { //密码全为数字，不合法

				result.firstResult.reg = false;
				result.firstResult.msg = "密码不能全为数字！";

			} else {

				if($(this).val().match(/\d+/g) != null && $(this).val().match(/[a-zA-Z]+/g) != null) { //必须包含字母和数字
					if($(this).val().length >= 6 && $(this).val().length <= 20) { //密码格式和长度合法
						result.firstResult.reg = true;
						result.firstResult.msg = "";
					} else { //密码格式合法，但长度不合法
						result.firstResult.reg = false;
						result.firstResult.msg = "密码长度不正确！";
					}

				} else { //密码格式不合法

					result.firstResult.reg = false;
					result.firstResult.msg = "密码必须包含数字和字母！";

				}

			}
			fun(result);

		},
		"focus": function() {

		}
	});
	/*第二次密码输入*/
	secondInputEle.bind({
		"keyup": function() {
			var realvalue = this.value.replace(/\s+/g, "");
			$(this).val(realvalue);

			if(result.firstResult.reg) { //确认密码提填写且合法

				if(firstInputEle.val().length == $(this).val().length) { //两次密码长度一致
					if(firstInputEle.val() == $(this).val()) { //与确认密码一致
						result.msg = "两次密码输入一致";
						result.reg = true;
						result.pwd = $(this).val();
					} else {
						result.msg = "两次密码输入不一致";
						result.reg = false;
						result.pwd = "";
					}
				} else if(firstInputEle.val().length <= $(this).val().length) {
					result.msg = "两次密码输入不一致";
					result.reg = false;
					result.pwd = "";
				} else {
					result.msg = "";
					result.reg = false;
					result.pwd = "";
				}

			} else { //确认密码未填写，或者确认密码不合法

			}
			fun(result);
		},
		"blur": function() {

			if(regLetter.test($(this).val())) { //密码全为字母，不合法

				result.secondResult.reg = false;
				result.secondResult.msg = "密码不能全为字母！";

			} else if(regNumber.test($(this).val())) { //密码全为数字，不合法

				result.secondResult.reg = false;
				result.secondResult.msg = "密码不能全为数字！";

			} else {

				if($(this).val().match(/\d+/g) != null && $(this).val().match(/[a-zA-Z]+/g) != null) { //必须包含字母和数字
					if($(this).val().length >= 6 && $(this).val().length <= 20) { //密码格式和长度合法
						result.secondResult.reg = true;
						result.secondResult.msg = ""
					} else { //密码格式合法，但长度不合法
						result.secondResult.reg = false;
						result.secondResult.msg = "密码长度不正确！"
					}

				} else { //密码格式不合法					
					result.secondResult.reg = false;
					result.secondResult.msg = "密码必须包含数字和字母！"

				}

			}
			fun(result);

		},
		"focus": function() {

		}
	});
}

function uploadPreview(picId, fileId) {
	var pic = document.getElementById(picId);
	var file = document.getElementById(fileId);
	if(window.FileReader) { //chrome,firefox7+,opera,IE10,IE9，IE9也可以用滤镜来实现
		oFReader = new FileReader();
		oFReader.readAsDataURL(file.files[0]);
		oFReader.onload = function(oFREvent) {
			pic.src = oFREvent.target.result;
		};
	} else if(document.all) { //IE8-
		file.select();
		var reallocalpath = document.selection.createRange().text //IE下获取实际的本地文件路径
		if(window.ie6) {
			pic.src = reallocalpath; //IE6浏览器设置img的src为本地路径可以直接显示图片
		} else { //非IE6版本的IE由于安全问题直接设置img的src无法显示本地图片，但是可以通过滤镜来实现，IE10浏览器不支持滤镜，需要用FileReader来实现，所以注意判断FileReader先
			pic.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image',src=\"" + reallocalpath + "\")";
			pic.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='; //设置img的src为base64编码的透明图片，要不会显示红xx
		}
	} else if(file.files) { //firefox6-
		if(file.files.item(0)) {
			url = file.files.item(0).getAsDataURL();
			pic.src = url;
		}
	}
}

jQuery(function($) {
	// 头部
	var menuType = sessionStorage.getItem("menuType") || "99"; // 99为无菜单选中
	if(menuType != "99") {
		$("#parkNav li").eq(menuType).addClass("on");
	}
	if(stringModule.CheckEmpty(sessionStorage.userId)) { // 已登陆
		var _userInfo = JSON.parse(localStorage.getItem("userInfo"));
		var _userCall = _userInfo && (_userInfo.acctName || _userInfo.mobile);
		_userCall = _userCall || "";
		$("#loginInfo").html("您好，" + _userCall);
		$("#parkLoginBtn").addClass("none");
		$("#loginInfo").removeClass("none");
		$("#leaveBtn").removeClass("none");
	} else { // 没登陆
		$("#parkLoginBtn").removeClass("none");
		$("#loginInfo").addClass("none");
		$("#leaveBtn").addClass("none");
	}
	//退出事件
	$("#leaveBtn").bind("click", function() {
		sessionStorage.setItem("menuType", "99");
		localStorage.removeItem("userInfo");
		sessionStorage.clear();
		window.location.href = "../home/login.html";
	});
	// 头部菜单切换
	$(".goto-page-btn").click(function() {
		var _menuType = $(this).attr("data-menu");
		sessionStorage.setItem("menuType", _menuType);
	});

	$("#parkLoginBtn").click(function() {
		sessionStorage.setItem("menuType", "99");
		window.location.href = "../home/login.html";
	});

	// 停车服务中心菜单切换

	var serviceNavItem = $(".service-nav-item");

	if(serviceNavItem.length > 0) {
		var serviceNavType = sessionStorage.getItem("serviceNavType") || "0"; // 99为无菜单选中
		serviceNavItem.eq(serviceNavType).addClass("pick");
		serviceNavItem.click(function() {
			var _serviceNavType = $(this).attr("data-menu");
			sessionStorage.setItem("serviceNavType", _serviceNavType);
		});
	} else {
		sessionStorage.setItem("serviceNavType", 0);
	}

});