jQuery(function($) {
	
	var loginBtnEle = $("#jst-login");
	var userIdEle = $("#jst-userid");
	var pwdEle = $("#jst-password");
	var codeEle = $("#jst-checkcode");
	var checkCodeImg = $("#check-codeimg");
	var firstLogin = "";
	var resetPwd = "";
	var resetPayPwd = "";
	var shopCode = "";
	var obj = "alertBox";
	var loginFlag = '';
	var checked = {
				firstPwd:false,
				secondPwd:false,
				payFirstPwd:false,
				paySecondPwd:false
		};
	var main = {
		// 初始化执行
		init: function() {
			var self = this;
			self.bindEvent();
			self.createCode();
		},
		// 事件绑定
		bindEvent: function() {
			var self = this;
			//更换验证码
			checkCodeImg.bind("click",function(){
				self.createCode();
			});
			//登陆按钮事件
			loginBtnEle.bind("click", function() {
				var userIdVal = userIdEle.val();
				var pwdVal = pwdEle.val();
				var codeVal = codeEle.val();
				if(stringModule.CheckEmpty(userIdVal) && stringModule.CheckEmpty(pwdVal) && stringModule.CheckEmpty(codeVal)) {
					httpModule.ajaxRequest({
						name: "登陆", // 接口名称
						type: "GET",
						async:false,
						url: shopIp + "wxdc-mgr-service/user/login",
						data: {
							userId: userIdVal,
							password: exports.encryptPwd(pwdVal),
							checkCode: codeVal
						},
						success: function(res) {
							if(res.code == "200") {
								sessionStorage.id = res.data.id;
								sessionStorage.userId = res.data.userId;
								sessionStorage.userName = res.data.userName;
								window.location.href = "../wxdc/public.html";									
							} else {
								alertTitle = '<h4 class="center alert-title">提示</h4>';
			                    alertContent = '<div class="alert-content"> ' +
			                    					'<p class="center">'+res.msg+'</p>'+	 
			                    				'</div>';
			                    alertWidth = 330;
			                    alertBtn = [
												{
													html: "知道了",
													"class" : "alert-btn",
													click: function() {												
														$( this ).dialog( "close" ); 
														main.createCode();
													}
												}
											];
								exports.alertBox(obj,alertTitle,alertContent,alertBtn,alertWidth);
							}
						}
					});
				} else {				
					alertTitle = '<h4 class="center alert-title">提示</h4>';
                    alertContent = '<div class="alert-content"> ' +
                    					'<p class="center">请填写完整的账号、密码和验证码</p>'+	 
                    				'</div>';
                    alertWidth = 330;
                    alertBtn = [
									{
										html: "知道了",
										"class" : "alert-btn",
										click: function() {												
											$( this ).dialog( "close" ); 
											main.createCode();
										}
									}
								];
					exports.alertBox(obj,alertTitle,alertContent,alertBtn,alertWidth);
				}
			});
		},
		//生成验证码
		createCode:function(){
			checkCodeImg.attr("src", shopIp + "wxdc-mgr-service/wxdc/getCode?timeStamp="+ new Date().getTime());
		}
	};
	main.init();
	
});