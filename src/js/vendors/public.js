jQuery(function($) {
	var menuHtml = '<li class="hsub nav-li active"><a href="javascript:void(0)" class="dropdown-toggle"><i class="icon sh-icon"></i><span class="menu-text"> 个人中心 </span></a><ul class="submenu" id="shMenu"><li class="nav-li"><a href="c_bill.html" class="second-menu">账单</a></li></ul></li><li class="hsub nav-li"><a href="javascript:void(0)" class="dropdown-toggle"><i class="icon jy-icon"></i><span class="menu-text">银行卡</span></a></li><li class="hsub nav-li active"><a href="javascript:void(0)" class="dropdown-toggle"><i class="icon js-icon"></i><span class="menu-text">上传身份证</span></a></li><li class="hsub nav-li"><a href="javascript:void(0)"><i class="icon js-icon"></i><span class="menu-text"> 设置 </span></a></li>';
	$("#menu").html(menuHtml);
	var menuEle = $("#menu"),
		shMenuEle = $("#shMenu"),
		jyMenuEle = $("#jyMenu"),
		jsMenuEle = $("#jsMenu"),
		ejMenuEle = $("#ejMenu"),
		setState = "",
		main = {
			init: function() {
				var self = this;
				//				self.getQuestionState();
				self.bindEvent();
			},
			bindEvent: function() {
				//用户名
				if(!stringUtil.isEmpty(local.getItem("userName"))) {
					$(".top-username").text("您好，" + local.getItem("userName"));
				}

				//一级菜单
				menuEle.on("click", ".hsub", function() {
					var index = $(this).index();
					$(this).addClass("menu-on");
					$(this).siblings().removeClass("menu-on");
					$(this).removeClass("active");
					if($(this).hasClass("open")) {
						$(this).removeClass("menu-on");

					} else {

					}

					if(index == 0) {
						if(!$(".hsub").eq(0).hasClass("active")) {
							window.location.href = "c_index.html";
						}
					}

					if(index == 1) {
						window.location.href = "c_bankcard.html";
					}

					if(index == 2) {
						if(!$(".hsub").eq(2).hasClass("active")) {
							window.location.href = "c_upload_ident.html";
						}
					}

					if(index == 3) {
						window.location.href = "c_reset_login_pwd.html";

					}

					if($(this).find(".nav-li").hasClass("menu-on")) {
						$(this).removeClass("menu-on");
					} else {

					}

				});

				/**二级菜单**/

				//我的商户
				shMenuEle.on("click", ".nav-li", function(e) {
					e.stopPropagation()
					$(this).addClass("menu-on");
					$(this).siblings().removeClass("menu-on");

					jyMenuEle.find(".nav-li").removeClass("menu-on");
					jsMenuEle.find(".nav-li").removeClass("menu-on");
					ejMenuEle.find(".nav-li").removeClass("menu-on");

					var index = $(this).index();
					switch(index) {
						case 0:
							//						alert("暂未开放")
							window.location.href = "../account/base_info.html";
							break;
						default:
							break;
					}

				});

				//交易管理
				jyMenuEle.on("click", ".nav-li", function(e) {
					e.stopPropagation()
					$(this).addClass("menu-on");
					$(this).siblings().removeClass("menu-on");

					shMenuEle.find(".nav-li").removeClass("menu-on");
					jsMenuEle.find(".nav-li").removeClass("menu-on");
					ejMenuEle.find(".nav-li").removeClass("menu-on");

					var index = $(this).index();
					switch(index) {
						case 0:
							window.location.href = "../account/trade_record.html";
							break;
						default:
							break;
					}
				});

				//结算管理
				jsMenuEle.on("click", ".nav-li", function() {
					$(this).addClass("menu-on");
					$(this).siblings().removeClass("menu-on");

					shMenuEle.find(".nav-li").removeClass("menu-on");
					jyMenuEle.find(".nav-li").removeClass("menu-on");
					ejMenuEle.find(".nav-li").removeClass("menu-on");

					var index = $(this).index();
					//					switch (index){
					//						case 0:
					window.location.href = "../account/account_settle_list.html";
					//							break;
					//						case 1:
					//							window.location.href = "../account/account_settle_list.html";
					//							break;
					//						default:
					//							break;
					//					}
				});
				//二级商户
				ejMenuEle.on("click", ".nav-li", function() {
					$(this).addClass("menu-on");
					$(this).siblings().removeClass("menu-on");

					shMenuEle.find(".nav-li").removeClass("menu-on");
					jsMenuEle.find(".nav-li").removeClass("menu-on");
					jyMenuEle.find(".nav-li").removeClass("menu-on");

					var index = $(this).index();
					//					switch (index){
					//						case 0:
					//							window.location.href = "../account/second_merchant.html";
					//							break;
					//						case 1:
					//							window.location.href = "../account/new_merchant.html";
					//							break;
					//						default:
					//							break;
					//					}
				})

				//退出事件
				$(".logout").bind("click", function() {
					sessionStorage.clear();
					window.location.href = "../home/c_login.html";
				});

				/*设置nav点击事件*/
				$(".set-nav-box").on("click", ".set-nav-item", function() {

					var href = $(this).attr("data-href");
					if(href == undefined) {
						return;
					}
					var index = $(this).index();

					if(index == 4) {
						main.getQuestionState()

					} else {
						window.location.href = href;
					}

				});
				/*设置左边nav点击事件*/
				$(".left-nav-cell").on("click", ".left-nav-item", function() {
					var href = $(this).attr("data-href");
					if(sessionStorage.getItem("setState") == "1" && href == "security_set.html") {
						alert("您已设置了安全问题，不可再设置");
					} else if(sessionStorage.getItem("setState") == "0" && href == "security_mod_affirm.html") {
						alert("请现设置安全问题");
					} else {
						window.location.href = href;
					}

				})
			},
			//获取安全问题设置状态
			getQuestionState: function() {
				httpModule.ajaxRequest({
					name: "获取用户的安全问题",
					type: "POST",
					async: true,
					url: shopIp + "jst-finance-merchantFront/rest/merchantController/querySecurity",
					//					url:"http://10.101.90.19:8080/jst-finance-merchantFront/rest/merchantController/querySecurity",
					data: {
						userId: sessionStorage.userId
					},
					success: function(data) {

						if(data.resType == "00") {

							if(data.securityIssue != "" || data.securityIssue != null || data.securityIssue != undefined) {
								setState = "1"; //已设置安全问题

							} else {
								setState = "0"; //未设置安全问题								

							}
						} else {
							setState = "0"; //未设置安全问题
						}
						sessionStorage.setItem("setState", setState);
						if(setState == "1") {
							window.location.href = "security_mod_affirm.html";
						} else {
							window.location.href = "security_set.html";
						}
					}
				});
			}
		};
	main.init();

});