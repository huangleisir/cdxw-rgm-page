/**
 * 车牌键盘
 * version:1.0.1
 * created by ajBoom/chengjun.zhu@jieshunpay.cn
 * 用法：require("./popup_plate_number").show({

					isAddCar: true, //是否添加车牌
					doneCallback:function(){},//输完密码之后的回调


				})
 */
require("./mui_expansion");

module.exports = (function($) {
	$.dom = function(str) {
		if(typeof(str) !== 'string') {
			if((str instanceof Array) || (str[0] && str.length)) {
				return [].slice.call(str);
			} else {
				return [str];
			}
		}
		if(!$.__create_dom_div__) {
			$.__create_dom_div__ = document.createElement('div');
		}
		$.__create_dom_div__.innerHTML = str;
		return [].slice.call($.__create_dom_div__.childNodes);
	};
	var returnResult = {},

		KEYBOARD_PANEL = ".popup-plate-view", //整个密码输入面板
		HEADER = ".ban-cell", //头部
		HEADER_TITLE = ".ban-title", //头标题
		INPUT_BOX = ".p-p-plate-box", //上半部分格子及输入提示

		O_PLATE_INPUT_BOX = ".o-plate-item", //普通车牌输入显示框
		N_PLATE_INPUT_BOX = ".n-plate-item", //新能源输入显示框

		SHORTNAME_PANEL = ".shortname-keyboard-box", //省份简称面板
		SHORTNAME_KEY_ITEM = ".shortname-key-item", //省份简称按键
		SHORTNAME_DEL_ITEM = ".key-shortname-del", //省份简称面板删除键

		NUM_PANEL = ".p-num-keyboard", //数字、字母面板
		NUM_KEY_ITEM = ".num-key-item", //数字字母按键
		NUM_DEL_ITEM = ".key-num-del", //数字、字母面板删除键
		NUM_KEY = ".num", //数字按键

		POLICE_KEY = ".police_item", //领、警按键
		SPECIAL_KEY = ".special_item", //港、澳按键

		X_ICON = ".x-icon", //叉叉

		NEW_BTN = ".new-btn", //车牌类型切换至新能源按钮

		ENERNG_INPUT = ".energy-plate-box", //新能源车牌输入

		OR_BTN = ".ord-btn", //车牌类型切换至普通按钮

		ORDINARY_INPUT = ".ordinary-plate-box", //普通车牌输入

		SUB_BTN = ".sub-btn", //确定按钮

		ONLY_PANEL = ".only-panel", //只显示键盘

		stringUtil = require("./string_util"),
		winExp = require("./window_expansion"),
		activeKey = O_PLATE_INPUT_BOX,
		keyboardPanel = {
			init: function(options) {
				this.options = $.extend({
					ready: function() {}, //初始化完毕回调
					isAddCar: true, //是否添加车牌
					onlyPanel: false, //是否只要车牌键盘

					inputCompleteClose: false, //输完之后是否需要关闭输入界面
					callBack: function() {}
				}, options);
				this.wrapper = this.options.wrapper;
				this.inputPwd = ["", ""];
				this._init();
				this.plateNum = "";
			},
			plateType: "normal",
			//初始化
			_init: function() {
				this._initElements();

			},

			//创建DOM
			_initElements: function() {

				var self = this,
					_create = function(res) {
						$(KEYBOARD_PANEL).remove();
						var panel = $.dom(res);
						document.body.appendChild(panel[0]);
						self.wrapper = $(panel[0]);

						self._initEvent();
						$(KEYBOARD_PANEL).show();
						self.options.ready && self.options.ready();
					};

				postData("public/module/popup_plate_number.html", {}, _create, null, {
					requestType: "get",
					dataType: "html",
					localResource: true,
					autoCloseWait: false,
					showWait: false
				});

			},

			//绑定事件
			_initEvent: function() {
				var self = this;

				self.wrapper.on("tap", ONLY_PANEL, function() {
					self._closeWrapper();

				})

				//切换至新能源车牌
				self.wrapper.on("tap", NEW_BTN, function() {
					$(ORDINARY_INPUT).addClass("hide");
					$(ENERNG_INPUT).removeClass("hide");
					activeKey = N_PLATE_INPUT_BOX;
					self.plateNum = "";
					self._disponse();
					$(SUB_BTN).removeClass("sub-btn-on");
					//添加状态框
					self._addStateBorder();
					$(".embassy").addClass("untap");
					$(".aviation").addClass("untap");
					$(".police").addClass("untap");
				});
				//切换至普通车牌
				self.wrapper.on("tap", OR_BTN, function() {
					$(ORDINARY_INPUT).removeClass("hide");
					$(ENERNG_INPUT).addClass("hide");
					activeKey = O_PLATE_INPUT_BOX;
					self.plateNum = "";
					self._disponse();
					$(SUB_BTN).removeClass("sub-btn-on");
					//添加状态框
					self._addStateBorder();
					$(".embassy").removeClass("untap");
					$(".aviation").removeClass("untap");
					$(".police").removeClass("untap");
				});

				/**普通车牌输入开始**/
				//省份简称键盘
				self.wrapper.on("tap", SHORTNAME_KEY_ITEM, function(e) {
					e.stopPropagation();

					//只显示键盘时切换车牌类型
					if(self.options.onlyPanel && self.plateType == "new") {
						activeKey = N_PLATE_INPUT_BOX;
					} else if(self.options.onlyPanel && self.plateType == "normal") {
						activeKey = O_PLATE_INPUT_BOX;
					}

					if($(this).hasClass("untap")) { //含untap类的按键无效
						return false;
					}
					var $this = $(this),
						count = self.plateNum.length,
						val = $this.attr("val");

					if(val == "0") {

					} else if(val == "WJ") {

						$(SPECIAL_KEY).addClass("untap");
						$(POLICE_KEY).addClass("untap");

						$(".embassy").addClass("untap");
						$(".aviation").addClass("untap");
						$(".police").addClass("untap");
						if(self.plateNum.substring(0, 2) == "WJ") {
							self.plateNum = self.plateNum.substring(0, 2);
							return false;
						}
						self.plateNum += val;
						$(activeKey).eq(0).html(self.plateNum.substring(0, 2));
						$(activeKey).eq(1).html(self.plateNum.substring(2));

					} else if(val == "民航") {

						$(SPECIAL_KEY).addClass("untap");
						$(POLICE_KEY).addClass("untap");

						if(self.plateNum.substring(0, 2) == "WJ") {
							return false;
						}
						self.plateNum += val;

						$(activeKey).eq(0).html(val.substring(0, 1));
						$(activeKey).eq(1).html(val.substring(1));

						$(NUM_PANEL).removeClass("hide");
						$(SHORTNAME_PANEL).addClass("hide");

					} else if(val == "-1") {

					} else {

						self.plateNum += val;

						if(self.plateNum.length >= 2) {
							$(activeKey).eq(0).html(self.plateNum.substring(0, 2));
							$(activeKey).eq(1).html(self.plateNum.substring(2));
						} else {
							$(activeKey).eq(0).html(val);
							$(activeKey).eq(1).html("");
						}

						self._keyUntap();
						if(self.plateNum.substring(0, 2) == "WJ") {
							for(var p = 0; p < $(NUM_KEY).length; p++) {
								$(NUM_KEY).eq(p).removeClass("untap");
							}
						}
						$(NUM_PANEL).removeClass("hide");
						$(SHORTNAME_PANEL).addClass("hide");
					}

					if(self.plateNum.length >= 3) {
						$(NUM_PANEL).removeClass("hide");
						$(SHORTNAME_PANEL).addClass("hide");
					}

					if(self.plateNum.substring(0, 1) == "使") {
						$(POLICE_KEY).addClass("untap");

					}

					//添加状态框
					self._addStateBorder();
					if(self.options.onlyPanel) {
						self._inputingBack()
					}

				});

				//省分简称删除键
				self.wrapper.on("tap", SHORTNAME_DEL_ITEM, function(e) {
					e.stopPropagation();
					//只显示键盘时切换车牌类型
					if(self.options.onlyPanel && self.plateType == "new") {
						activeKey = N_PLATE_INPUT_BOX;
					} else if(self.options.onlyPanel && self.plateType == "normal") {
						activeKey = O_PLATE_INPUT_BOX;
					}

					var count = self.plateNum.length;
					if(self.plateNum == "民航") {

						$(activeKey).eq(count - 1).html("");
						self.plateNum = self.plateNum.substring(0, count - 1);
						for(var i = 0; i < self.plateNum.length; i++) {
							$(activeKey).eq(i).html(self.plateNum[i]);
						}
					} else {
						$(activeKey).eq(0).html("");
						self.plateNum = "";
						$(".embassy").removeClass("untap");
						$(".aviation").removeClass("untap");
						$(".police").removeClass("untap");
					}
					count--;

					//添加状态框
					self._addStateBorder();
					if(self.options.onlyPanel) {
						self._inputingBack()
					}
				});

				//数字、字母键盘
				self.wrapper.on("tap", NUM_KEY_ITEM, function(e) {
					e.stopPropagation();
					//只显示键盘时切换车牌类型
					if(self.options.onlyPanel && self.plateType == "new") {
						activeKey = N_PLATE_INPUT_BOX;
					} else if(self.options.onlyPanel && self.plateType == "normal") {
						activeKey = O_PLATE_INPUT_BOX;
					}

					var $this = $(this),
						count = self.plateNum.length,
						val = $this.attr("val");
					if(val == "-2") { //空按键

					} else if(val == "-1") { //删除按键

					} else { //可输入按键

						if($(activeKey).eq(1)[0].innerText == "") {

							$(SPECIAL_KEY).addClass("untap");
							$(POLICE_KEY).addClass("untap");

							for(var a = 0; a < $(NUM_KEY).length; a++) {
								$(NUM_KEY).eq(a).addClass("untap");
							}

						} else if($(activeKey).eq(0)[0].innerText == "粤" && $(activeKey).eq(1)[0].innerText == "Z" && $(activeKey).eq(5)[0].innerText != "") {

							if(activeKey == O_PLATE_INPUT_BOX) {

								$(SPECIAL_KEY).removeClass("untap");
							} else {

								$(SPECIAL_KEY).addClass("untap");
							}

							$(POLICE_KEY).addClass("untap");

						} else {

							$(SPECIAL_KEY).addClass("untap");

							if(activeKey == O_PLATE_INPUT_BOX && $(activeKey).eq(5)[0].innerText == "") {
								$(POLICE_KEY).addClass("untap");

							} else if(activeKey == N_PLATE_INPUT_BOX) { // && $(activeKey).eq(6)[0].innerText == ""
								$(POLICE_KEY).addClass("untap");

							} else {
								if(self.plateNum.substring(0, 1) != "使") {
									$(POLICE_KEY).removeClass("untap");

								}

							}
							for(var a = 0; a < $(NUM_KEY).length; a++) {
								$(NUM_KEY).eq(a).removeClass("untap");
							}
							if(self.plateNum.substring(0, 2) == "WJ" || self.plateNum.substring(0, 2) == "民航" || self.plateNum.substring(0, 2) == "粤Z") {
								$(POLICE_KEY).addClass("untap");

								if(self.plateNum.substring(0, 2) == "粤Z" && self.plateNum.length > 5) {

									$(SPECIAL_KEY).removeClass("untap");
								} else {

									$(SPECIAL_KEY).addClass("untap");
								}

							}
						}
						if($(this).hasClass("untap")) {
							return false;
						}
						self.plateNum += val;

						if(self.plateNum.substring(0, 2) == "WJ") {
							if(activeKey == O_PLATE_INPUT_BOX) { //普通车牌长度
								self.plateNum = self.plateNum.substring(0, 8);
							} else if(activeKey == N_PLATE_INPUT_BOX) { //新能源车牌长度
								self.plateNum = self.plateNum.substring(0, 9);
							}

							$(activeKey).eq(0).html(self.plateNum.substring(0, 2));
							$(activeKey).eq(1).html(self.plateNum.substring(2, 3));
							var temp = self.plateNum.substring(3);
							for(var j = 0; j < temp.length; j++) {
								$(activeKey).eq(j + 2).html(temp[j]);
							}

						} else {
							if(activeKey == O_PLATE_INPUT_BOX) { //普通车牌长度
								self.plateNum = self.plateNum.substring(0, 7);

							} else if(activeKey == N_PLATE_INPUT_BOX) { //新能源车牌长度
								self.plateNum = self.plateNum.substring(0, 8);
							}

							for(var i = 0; i < self.plateNum.length; i++) {
								$(activeKey).eq(i).html(self.plateNum[i]);
							}
						}
					}

					if(self.plateNum.substring(0, 2) == "WJ") {

						if(self.plateNum.length < 3) {
							$(NUM_PANEL).addClass("hide");
							$(SHORTNAME_PANEL).removeClass("hide");
						}

					} else {
						if(self.plateNum.length < 1) {
							$(NUM_PANEL).addClass("hide");
							$(SHORTNAME_PANEL).removeClass("hide");
						} else {
							for(var x = 0; x < $(NUM_KEY).length; x++) {
								$(NUM_KEY).eq(x).removeClass("untap");
							}
						}
					}

					if(activeKey == O_PLATE_INPUT_BOX) {

						if($(O_PLATE_INPUT_BOX).eq(6)[0].innerText != "") {
							$(SUB_BTN).addClass("sub-btn-on");
						} else {
							$(SUB_BTN).removeClass("sub-btn-on");
						}

						if(self.plateNum.substring(0, 2) == "WJ" || self.plateNum.substring(0, 2) == "民航" || self.plateNum.substring(0, 2) == "粤Z") {
							$(POLICE_KEY).addClass("untap");

							if(self.plateNum.substring(0, 2) == "粤Z" && self.plateNum.length > 5) {

								$(SPECIAL_KEY).removeClass("untap");
							} else {

								$(SPECIAL_KEY).addClass("untap");
							}

						} else {
							if(self.plateNum.length < 6 || self.plateNum.length >= 7) {
								$(POLICE_KEY).addClass("untap");

							} else {
								if(self.plateNum.substring(0, 1) != "使") {
									$(POLICE_KEY).removeClass("untap");

								}
							}
						}

					} else if(activeKey == N_PLATE_INPUT_BOX) {
						if($(N_PLATE_INPUT_BOX).eq(7)[0].innerText != "") {
							$(SUB_BTN).addClass("sub-btn-on");
						} else {
							$(SUB_BTN).removeClass("sub-btn-on");
						}
					}

					//添加状态框
					self._addStateBorder();

					if(self.options.onlyPanel) {
						self._inputingBack()
					}

				});

				//数字、字母键盘删除按键
				self.wrapper.on("tap", NUM_DEL_ITEM, function(e) {
					e.stopPropagation();
					//只显示键盘时切换车牌类型
					if(self.options.onlyPanel && self.plateType == "new") {
						activeKey = N_PLATE_INPUT_BOX;
					} else if(self.options.onlyPanel && self.plateType == "normal") {
						activeKey = O_PLATE_INPUT_BOX;
					}

					var count = self.plateNum.length;
					if(self.plateNum.substring(0, 2) == "WJ") {
						$(activeKey).eq(0).html("WJ");
						$(activeKey).eq(count - 2).html("");

						self.plateNum = self.plateNum.substring(0, count - 1);
						var d_temp = self.plateNum.substring(2);
						for(var b = 0; b < d_temp.length; b++) {
							$(activeKey).eq(b + 1).html(d_temp[b]);
						}

					} else if(self.plateNum.substring(0, 2) == "民航") {
						$(activeKey).eq(0).html("民");
						$(activeKey).eq(1).html("航");
						$(activeKey).eq(count - 1).html("");
						self.plateNum = self.plateNum.substring(0, count - 1);
						var m_temp = self.plateNum.substring(2);

						if(m_temp == "") {
							$(activeKey).eq(0).html("");
							$(activeKey).eq(1).html("");
							self.plateNum = "";
						} else {
							for(var b = 0; b < m_temp.length; b++) {
								$(activeKey).eq(b + 2).html(m_temp[b]);
							}
						}

					} else {

						$(activeKey).eq(count - 1).html("");
						self.plateNum = self.plateNum.substring(0, count - 1);
						for(var a = 0; a < self.plateNum.length; a++) {
							$(activeKey).eq(a).html(self.plateNum[a]);
						}
						if($(activeKey).eq(1)[0].innerText == "") {
							self._keyUntap();
						} else {
							for(var z = 0; z < $(NUM_KEY).length; z++) {
								$(NUM_KEY).eq(z).removeClass("untap");
							}
						}

					}
					count--;

					if(self.plateNum.substring(0, 2) == "WJ") {
						if(self.plateNum.length < 3) {
							$(NUM_PANEL).addClass("hide");
							$(SHORTNAME_PANEL).removeClass("hide");
						}

					} else {
						if(self.plateNum.length < 1) {
							$(NUM_PANEL).addClass("hide");
							$(SHORTNAME_PANEL).removeClass("hide");
						}
					}

					if(activeKey == O_PLATE_INPUT_BOX) {

						if($(O_PLATE_INPUT_BOX).eq(6)[0].innerText != "") {
							$(SUB_BTN).addClass("sub-btn-on");
						} else {
							$(SUB_BTN).removeClass("sub-btn-on");
						}

						if(self.plateNum.substring(0, 2) == "WJ" || self.plateNum.substring(0, 2) == "民航" || self.plateNum.substring(0, 2) == "粤Z") {
							$(POLICE_KEY).addClass("untap");

							if(self.plateNum.substring(0, 2) == "粤Z" && self.plateNum.length > 5) {

								$(SPECIAL_KEY).removeClass("untap");
							} else {

								$(SPECIAL_KEY).addClass("untap");
							}

						} else {
							if(self.plateNum.length < 6) {
								$(POLICE_KEY).addClass("untap");

							} else {
								if(self.plateNum.substring(0, 1) != "使") {
									$(POLICE_KEY).removeClass("untap");

								}
							}
						}

					} else if(activeKey == N_PLATE_INPUT_BOX) {
						if($(N_PLATE_INPUT_BOX).eq(7)[0].innerText != "") {
							$(SUB_BTN).addClass("sub-btn-on");
						} else {
							$(SUB_BTN).removeClass("sub-btn-on");
						}
					}

					//添加状态框
					self._addStateBorder();

					if(self.options.onlyPanel) {
						self._inputingBack()
					}

				})

				//普通车牌输入时的叉叉
				self.wrapper.on("tap", X_ICON, function() {
					self._closeWrapper();
					self.plateNum = "";
					self._disponse();
				});

				//确定按钮点击事件
				self.wrapper.on("tap", SUB_BTN, function() {

					if($(this).hasClass("sub-btn-on")) {
						self._closeWrapper();
						self._inputComplete();
						self.plateNum = "";
						self._disponse();
					}

				})

				if(self.options.onlyPanel) {
					$(".p-p-input-box").addClass("hide"); //车牌输入显示框
					$(".popup-plate-view").addClass("no-input");
				}

			},
			/*
			 部分按键失效
			 * */
			_keyUntap: function() {
				var self = this;

				$(SPECIAL_KEY).addClass("untap");
				$(POLICE_KEY).addClass("untap");

				for(var a = 0; a < $(NUM_KEY).length; a++) {
					$(NUM_KEY).eq(a).addClass("untap");
				}
			},
			/**
			 * 添加状态框
			 * */
			_addStateBorder: function() {
				var self = this;
				if(self.plateNum.length <= 0) {
					for(var x = 0; x < $(activeKey).length; x++) {
						$(activeKey).eq(x).removeClass("on-input");
					}
					if(activeKey == O_PLATE_INPUT_BOX) {
						$(activeKey).eq(0).addClass("on-input");
					} else if(activeKey == N_PLATE_INPUT_BOX) {
						$(activeKey).eq(0).addClass("on-input");
					}
				} else {
					if(activeKey == O_PLATE_INPUT_BOX) {
						for(var v = 0; v < $(activeKey).length; v++) {
							$(activeKey).eq(v).removeClass("on-input");
						}
						if(self.plateNum.substring(0, 2) == "WJ") {
							$(activeKey).eq(self.plateNum.length - 1).addClass("on-input");
						} else if(self.plateNum.substring(0, 2) == "民航") {
							$(activeKey).eq(self.plateNum.length).addClass("on-input");
						} else {
							$(activeKey).eq(self.plateNum.length).addClass("on-input");
						}

					} else if(activeKey == N_PLATE_INPUT_BOX) {
						for(var v = 0; v < $(activeKey).length; v++) {
							$(activeKey).eq(v).removeClass("on-input");
						}
						if(self.plateNum.substring(0, 2) == "WJ") {
							$(activeKey).eq(self.plateNum.length - 1).addClass("on-input");
						} else if(self.plateNum.substring(0, 2) == "民航") {
							$(activeKey).eq(self.plateNum.length).addClass("on-input");
						} else {
							$(activeKey).eq(self.plateNum.length).addClass("on-input");
						}
					}

				}

				if(self.plateNum.length >= 2) {
					$("#numTitle").html("请选择车牌号");
				} else {
					$("#numTitle").html("请选择城市代码");
				}

			},
			/**
			 * 输入完毕回调
			 */
			_inputComplete: function() {
				this.options.doneCallback && this.options.doneCallback(this._getPassword());
				if(this.options.inputCompleteClose) {
					this._closeWrapper();
				}
			},
			/**
			 * 输入中回调
			 * */
			_inputingBack: function() {
				this.options.doingCallback && this.options.doingCallback(this._getPassword());
			},
			//获取输入密码
			_getPassword: function() {
				var self = this;
				var plate = self.plateNum;

				return plate;

			},
			/**
			 * 清空一输入的内容
			 */
			_disponse: function() {
				var self = this;
				self.plateNum = "";
				for(var i = 0; i < $(O_PLATE_INPUT_BOX).length; i++) {
					$(O_PLATE_INPUT_BOX).eq(i)[0].innerText = "";
					$(O_PLATE_INPUT_BOX).eq(i).removeClass("on-input");
				}
				for(var i = 0; i < $(N_PLATE_INPUT_BOX).length; i++) {
					$(N_PLATE_INPUT_BOX).eq(i)[0].innerText = "";
					$(N_PLATE_INPUT_BOX).eq(i).removeClass("on-input");
				}
				$(SHORTNAME_PANEL).removeClass("hide");
				$(NUM_PANEL).addClass("hide");
				$(SUB_BTN).removeClass("sub-btn-on");

				$(activeKey).eq(0).addClass("on-input")

				if(activeKey == O_PLATE_INPUT_BOX) {
					$(".embassy").removeClass("untap");
					$(".aviation").removeClass("untap");
					$(".police").removeClass("untap");
				}

			},

			//显示车牌面板
			_showWrapper: function() {

				var self = this;

				$(KEYBOARD_PANEL).addClass("active");
			},

			//隐藏密码支付面板
			_closeWrapper: function() {
				var self = this;

				$(KEYBOARD_PANEL).removeClass("active");

			}

		};

	//API

	/**
	 * 初始化密码输入框
	 * @param {Object} option:doneCallback输入完成之后的回调,beforeShow显示键盘之前回调
	 */
	returnResult.init = function(options) {
		keyboardPanel.init(options);
	};

	/**
	 * 显示密码输入面板
	 * @param {Object} doneCallback:输完密码之后的回调
	 */
	returnResult.show = function(options) {
		var options = options || {};
		if(options.withInit) {
			options.closeDestruction = true;
			options.ready = function() {
				//				setTimeout(function() {
				keyboardPanel._showWrapper();
				//				}, 300);

			};
			keyboardPanel.init(options);
		} else {
			keyboardPanel._showWrapper();
		}
	}

	/**
	 * 隐藏密码输入面板
	 */
	returnResult.hide = function() {
		keyboardPanel._closeWrapper();
	}

	/**
	 * 显示键盘
	 */
	returnResult.showKeyItem = function() {
		keyboardPanel._showKeyItem();
	}

	/**
	 * 隐藏键盘
	 */
	returnResult.hideKeyItem = function() {
		keyboardPanel._hideKeyItem();
	}

	/**
	 * 清除已输入密码
	 */
	returnResult.clear = function() {
		keyboardPanel._disponse();
	};
	/**
	 * 修改车牌类型
	 * */
	returnResult.changePlateType = function(type) {
		keyboardPanel.plateType = type;
		console.log(type)
	};

	/**
	 * 获取输入的密码
	 */
	returnResult.getPlateNum = function() {
		return keyboardPanel._getPassword();
	};

	return returnResult;
})(mui);