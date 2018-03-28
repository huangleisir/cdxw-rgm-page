/**
 * 发送验证码模块
 * created by LittleYellow/441980627@qq.com
 */

window.sccModule = (function($) {

	function checkCode() {
		this.status = "00"; // 00-未倒计时 01-正在倒计时
	}

	// 初始化
	checkCode.prototype.init = function(params) {
		var defaults = {
			title: "获取验证码",
			reqData: "",
			isInit: true, // true-自动发短信 false-手动发短信
			doneBack: function() {}
		};
		var self = this;
		this.doneData = {};
		this.options = $.extend(defaults, params);
		var pageHtml = '<div id="sendMask" class="send-mask close-btn"></div>' +
			'<div class="send-box">' +
			'<header class="app-header-box">' +
			'<a class="app-header-back close-btn"></a>' +
			'<h1 class="app-header-title">' + this.options.title + '</h1>' +
			'</header>' +
			'<div id="sendMobile" class="send-mobile"></div>' +
			'<div class="send-cell">' +
			'<input id="codeInput" class="clear-input code-input" type="tel" maxlength="6" placeholder="请输入验证码" />' +
			'<input id="codeBtn" class="code-btn" type="button" value="获取验证码" />' +
			'</div>' +
			'<section class="send-btn">' +
			'<div id="doBtn" class="push-btn lock">确定</div>' +
			'</section>' +
			'</div>';
		document.querySelector("body").insertAdjacentHTML("beforeEnd", pageHtml);
		this.sendMaskEle = document.querySelector("#sendMask");
		this.sendBoxEle = document.querySelector(".send-box");
		this.sendMobileEle = document.querySelector("#sendMobile");
		this.codeInputEle = document.querySelector("#codeInput");
		this.codeBtnEle = document.querySelector("#codeBtn");
		this.closeBtn = document.querySelectorAll(".close-btn");
		this.doneBtnEle = document.querySelector("#doBtn");
		this.bindEvent();
		if(this.options.isInit) {
			setTimeout(function() {
				self.open();
				if(self.status == "00") {
					self.getCode(self.codeBtnEle);
				}
			}, 10);
		}
	}

	// 事件绑定
	checkCode.prototype.bindEvent = function() {
		var self = this;
		this.codeInputEle.addEventListener("input", function() {
			if(this.value.length > 0) {
				self.doneBtnEle.classList.remove("lock");
			} else {
				self.doneBtnEle.classList.add("lock");
			}
		});
		this.codeBtnEle.addEventListener("click", function() {
			if(this.getAttribute("disabled") != "true") {
				self.getCode(this);
			}
		});
		for(var t = 0; t < this.closeBtn.length; t++) {
			this.closeBtn[t].addEventListener("click", function() {
				self.close();
			});
		}
		this.doneBtnEle.addEventListener("click", function() {
			if(this.classList.toString().indexOf("lock") == -1) {
				self.doneBack();
			}
		});

	}
	// 显示
	checkCode.prototype.open = function(_reqData) {
		this.options.reqData = _reqData;
		this.sendMobileEle.innerHTML = '请输入手机' + stringUtil.infoProtectDeal({
			targetStr: this.options.reqData.telphone,
			keepStart: 3,
			keepEnd: 4,
			cipherLen: 4
		}) + '收到的短信验证码';
		//		this.sendBoxEle.classList.remove("hide");
		//		this.sendBoxEle.classList.add("show");
		$(this.sendMaskEle).show();
		$(this.sendBoxEle).css({
			"transform": "translateY(180px)",
			"-webkit-transform": "translateY(180px)"
		});
		if(this.status == "00") {
			this.getCode(this.codeBtnEle);
		}
	}
	//隐藏
	checkCode.prototype.close = function() {
		//		this.sendBoxEle.classList.remove("show");
		//		this.sendBoxEle.classList.add("hide");
		$(this.sendMaskEle).hide();
		$(this.sendBoxEle).css({
			"transform": "translateY(500%)",
			"-webkit-transform": "translateY(500%)"
		});
		this.codeInputEle.value = "";
	}
	// 清除计时
	checkCode.prototype.clearTimer = function() {
		clearTimeout(this.timer);
		this.codeBtnEle.removeAttribute("disabled");
		this.codeBtnEle.value = "获取验证码";
	}
	// 发送验证码
	checkCode.prototype.getCode = function(el) {
		var self = this;
		this.timeDown(el);
		httpModule.ajaxRequest({
			name: "发送验证码-重置支付密码", // 接口名称
			type: "POST",
			//contentType: "application/json;charset=utf-8",
			url: "app/rest/updPaypwdAndAuthen",
			data: {
				token: self.options.reqData.token,
				bankCode: self.options.reqData.bankCode,
				bankCardNo: self.options.reqData.bankCardNo,
				bankCardType: self.options.reqData.bankCardType,
				bankCardName: self.options.reqData.bankCardName,
				certType: "01",
				operType: 2
			},
			success: function(res) {
				if(res.resType == "00") {
					self.doneData.rkey = res.rkey; //短信跟踪码
				} else {
					$.toast(res.msgContent);
				}
			}
		});

	}
	// 提交验证码
	checkCode.prototype.doneBack = function() {
		var self = this;
		var mesCode = self.codeInputEle.value;
		self.doneData.mesCode = mesCode;
		if(!stringUtil.isEmpty(self.doneData.rkey)) {
			self.close();
			self.clearTimer();
			self.options.doneBack(self.doneData);
		} else {
			alert("系统异常：获取短信跟踪码失败");
		}
	}
	// 倒计时
	checkCode.prototype.timeDown = function(o, s) {
		var t = arguments[1] || arguments[1] == 0 ? arguments[1] : 60;
		var self = this;
		if(t == 0) {
			self.status = "00";
			o.removeAttribute("disabled");
			o.value = "获取验证码";
		} else {
			self.status = "01";
			o.setAttribute("disabled", true);
			o.value = "(" + t + "秒)重新获取";
			t--;
			self.timer = setTimeout(function() {
				self.timeDown(o, t);
			}, 1000);
		}
	}

	return new checkCode();
})(jQuery);