$(function() {

	var userId = sessionStorage.userId,
		onLine = sessionModule.isLogin(sessionStorage.userId),
		subBtn = $("#subBtn"),
	main = {
		//初始化
		init: function() {
			if(stringModule.CheckEmpty(onLine)) { // 判断用户是否处于登陆状态
				return false;
			}
			
			var self = this;
			self.getSystemParamInfo();
			self.bindEvent();
		},
		returnFloat:function(value){
			var value=Math.round(parseFloat(value)*100)/100;
			var xsd=value.toString().split(".");
			if(xsd.length==1){
				 value=value.toString()+".00";
				 return value;
			}
			if(xsd.length>1){
				if(xsd[1].length<2){
				 	value=value.toString()+"0";
			 	}
			}
			return value;
		},
		// 获取系统参数
		getSystemParamInfo: function(){
			$.ajax({
				headers: {
			        Accept:"application/json",						        
			    },
				type: "POST",
				url: shopIp + "wxdc-mgr-service/wxdc/querySendMoneySetting",
				contentType: "application/json; charset=utf-8",
				data: {},
				async: true,
				dataType: "json",
				success: function (res) {
					if(res.code == "200"){
						$("#jst-orderCillAmount").val(stringModule.amountFen2Yuan(res.data.orderCillAmount,2));
						$("#jst-sendAmount").val(stringModule.amountFen2Yuan(res.data.sendAmount,2));
						$("#jst-orderFreeAmount").val(stringModule.amountFen2Yuan(res.data.orderFreeAmount,2));
					}else{
						alertTitle = '<h4 class="center alert-title">提示</h4>';
				        alertContent = '<div class="alert-content"> ' +
				        					'<p class="center">'+ res.msg +'</p>'+	 									        					
				        				'</div>';
				        alertBtn = [
					        	{
									html: "知道了",
									"class" : "alert-btn",
									click: function() {
										$( this ).dialog( "close" );
									}
								}
							]
				        exports.alertBox("alertBox",alertTitle,alertContent,alertBtn,alertWidth);
					}
				},
				error: function () {
					alert("服务未开启");
				}
			});
		},
		//事件绑定
		bindEvent: function() {
			var self = this;
			// 保存
			subBtn.bind("click",function(){
				var orderCillAmountObj = $("#jst-orderCillAmount");
				var sendAmountObj = $("#jst-sendAmount");
				var orderFreeAmountObj = $("#jst-orderFreeAmount");
				var orderCillAmountCheckFlag = stringModule.regexpRule("float2",orderCillAmountObj.val(),"");
				var sendAmountCheckFlag	= stringModule.regexpRule("float2",sendAmountObj.val(),"");
				var orderFreeAmountCheckFlag = stringModule.regexpRule("float2",orderFreeAmountObj.val(),"");
				alertWidth = 600;
				alertTitle = '<h4 class="center alert-title">提示</h4>';
				if(!orderCillAmountCheckFlag.result){
			        alertContent = '<div class="alert-content"> ' +
			        					'<p class="center">'+orderCillAmountObj.attr("data-info")+'</p>'+	 									        					
			        				'</div>';
			        alertBtn = [
				        	{
								html: "知道了",
								"class" : "alert-btn",
								click: function() {
									$( this ).dialog( "close" );
								}
							}
						]
			        exports.alertBox("alertBox",alertTitle,alertContent,alertBtn,alertWidth);
			        return;
				}
				if(!sendAmountCheckFlag.result){
					alertContent = '<div class="alert-content"> ' +
			        					'<p class="center">'+sendAmountObj.attr("data-info")+'</p>'+	 									        					
			        				'</div>';
			        alertBtn = [
				        	{
								html: "知道了",
								"class" : "alert-btn",
								click: function() {
									$( this ).dialog( "close" );
								}
							}
						]
			        exports.alertBox("alertBox",alertTitle,alertContent,alertBtn,alertWidth);
			        return;
				}
				if(!orderCillAmountCheckFlag.result){
					alertContent = '<div class="alert-content"> ' +
			        					'<p class="center">'+orderFreeAmountObj.attr("data-info")+'</p>'+	 									        					
			        				'</div>';
			        alertBtn = [
				        	{
								html: "知道了",
								"class" : "alert-btn",
								click: function() {
									$( this ).dialog( "close" );
								}
							}
						]
			        exports.alertBox("alertBox",alertTitle,alertContent,alertBtn,alertWidth);
			        return;
				}
				var obj = {
					orderCillAmount: orderCillAmountObj.val().replace('.',''),
					sendAmount: sendAmountObj.val().replace('.',''),
					orderFreeAmount: orderFreeAmountObj.val().replace('.','')
				}
				$.ajax({
					headers: {
				        Accept:"application/json",						        
				    },
					type: "POST",
					url: shopIp + "wxdc-mgr-service/wxdc/updateSendMoneySetting",
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(obj),
					async: true,
					dataType: "json",
					success: function (res) {
						var alertWidth = 600;
						alertTitle = '<h4 class="center alert-title">提示</h4>';
				        alertContent = '<div class="alert-content"> ' +
				        					'<p class="center">'+ res.msg +'</p>'+	 									        					
				        				'</div>';
				        alertBtn = [
					        	{
									html: "知道了",
									"class" : "alert-btn",
									click: function() {
										$( this ).dialog( "close" );
									}
								}
							]
				        exports.alertBox("alertBox",alertTitle,alertContent,alertBtn,alertWidth);
					},
					error: function () {
						alert("服务未开启");
					}
				});
			});
			
			//input失去焦点事件
			$(".input-box input").bind("blur",function(){
				$(this).val(self.returnFloat($(this).val()));
				var checkStatus = stringModule.regexpRule("float2",$(this).val(),"");
				if(!checkStatus.result){
					    alertWidth = 600;
						alertTitle = '<h4 class="center alert-title">提示</h4>';
				        alertContent = '<div class="alert-content"> ' +
				        					'<p class="center">'+ $(this).attr("data-info") +'</p>'+	 									        					
				        				'</div>';
				        alertBtn = [
					        	{
									html: "知道了",
									"class" : "alert-btn",
									click: function() {
										$( this ).dialog( "close" );
									}
								}
							]
				        exports.alertBox("alertBox",alertTitle,alertContent,alertBtn,alertWidth);
				}
			});
		}
	};
	main.init();
	
});

