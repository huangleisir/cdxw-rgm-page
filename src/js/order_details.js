$(function() {

	var userId = sessionStorage.userId,
		onLine = sessionModule.isLogin(sessionStorage.userId),
		tableEle = $("#lists"),
		checkBtn = $("#checkMes"),
		resetBtn = $("#reset-btn"),
		exportBtn = $("#exportBtn"),
		id = exports.getUrlString("id"),
		jstOrderStatus = $("#jst-order-status"),
		menuOrderAmount = $(".menu-order-amount"),
		companyOrder = $(".company-order"),
		companySend = $(".company-send"),
		menuOrderReturn = $(".menu-order-return"),
		page = 1, //页码
	main = {
		//初始化
		init: function() {
			if(stringModule.CheckEmpty(onLine)) { // 判断用户是否处于登陆状态
				return false;
			}
			var self = this;
			self.dataInfo();
			self.dataInit();
			self.bindEvent();
		},
		//事件绑定
		bindEvent: function() {
			menuOrderReturn.bind("click",function(){
				window.location.href = "index.html";
			});
		},
		// 初始化数据
		dataInit: function() {
			var bsTable = {};
			// 查询条件
			bsTable.paramsGroup = function(params) {
				var obj = {
					pageSize: params.limit,
					currentPage: params.offset / params.limit + 1,
					id: id
				}
				return obj;
			};
			// 封装返回数据
			bsTable.resHandler = function(res) {
				if(res.code == "200") {
					if(res.data.list == undefined) {
						return {
							"rows": [],
							"total": 0
						};
					}
					return {
						"rows": res.data.list,
						"total": res.data.total
					};
				} else {
					return {
						"rows": [],
						"total": 0
					};
				}
			};
			// 加载数据
			tableEle.bootstrapTable({
				columns: [{
					field: 'foodName',
					title: '菜品',
					align: 'center',
					formatter:function(value,row,index){
						return "<div><img style='width:50px;height:50px;' src="+row.picPath+" /><span style='margin-left: 10px;'>"+row.foodName+"</span></div>";
					}
				}, {
					field: 'price',
					title: '单价',
					align: 'center',
					formatter:function(value,row,index){
						return "￥"+stringModule.amountFen2Yuan(value,2);
					}
				},{
					field: 'num',
					title: '数量',
					align: 'center',
					formatter:function(value,row,index){
						return "×"+value;
					}
				}, {
					field: 'priceTotal',
					title: '金额',
					align: 'center',
					formatter:function(value,row,index){
						return "￥"+stringModule.amountFen2Yuan(value,2);
					}
				}],
				height:500,
				method: 'post',
				striped: true,
				dataType: "json",
				pagination: true,
				queryParamsType: "limit",
				singleSelect: false,
				contentType: "application/json",
				pageSize: 10,
				pageNumber: 1,
				pageList: [10, 20, 30],
				search: false, //不显示 搜索框
				showColumns: false, //不显示下拉框（选择显示的列）
				sidePagination: "server", //服务端请求
				queryParams: bsTable.paramsGroup,
				responseHandler: bsTable.resHandler,
				url: shopIp + "wxdc-mgr-service/wxdc/queryOrderFoodList"
			});
		},
		//查询详情
		dataInfo:function(){
			var obj = {id:id};
			$.ajax({
				headers: {
			        Accept:"application/json",						        
			    },
				type: "POST",
				url: shopIp + "wxdc-mgr-service/wxdc/queryOrderDetail",
				contentType: "application/json",
				data: JSON.stringify(obj),
				async: true,
				dataType: "json",
				success: function (res) {
					if(res.code == "200"){
						var payType = "",payStatus = "",printStatus = "",sendStatus = "";
						if(res.data.payType == "1"){
							payType = "一卡通在线支付";
						}else if(res.data.payType == "2"){
							payType = "餐到付款";
						}
						if(res.data.payStatus == "0"){
							payStatus = "未支付";
						}else if(res.data.payStatus == "1"){
							payStatus = "已支付";
						}else if(res.data.payStatus == "2"){
							payStatus = "已关闭";
						}
						if(res.data.printStatus == "0"){
							printStatus = "未打印";
						}else if(res.data.printStatus == "1"){
							printStatus = "已打印";
						}
						if(res.data.sendStatus == "0"){
							sendStatus = "未确认";
						}else if(res.data.sendStatus == "1"){
							sendStatus = "已确认";
						}else if(res.data.sendStatus == "2"){
							sendStatus = "已配送";
						}
						jstOrderStatus.html(sendStatus);
						companyOrder.html(
									'<p>订单编号：<span id="jst-id">'+res.data.id+'</span></p>'+
								  	'<p>订单时间：<span id="jst-createTime">'+res.data.createTime+'</span></p>'+
								  	'<p>支付方式：<span id="jst-payType">'+payType+'</span></p>'+
								  	'<p>支付状态：<span id="jst-payStatus">'+payStatus+'</span></p>'+
								  	'<p>打印状态：<span id="jst-printStatus">'+printStatus+'</span></p>'+
								  	'<p>订单备注：<span id="jst-mark">'+res.data.mark+'</span></p>'
					  	);
						companySend.html(
									'<p>联系人：<span id="jst-name">'+res.data.name+'</span></p>'+
							  		'<p>电话：<span id="jst-mobile">'+res.data.mobile+'</span></p>'+
							  		'<p>配送状态：<span id="jst-sendStatus">'+sendStatus+'</span></p>'+
							  		'<p>送餐地址：<span id="jst-addr">'+res.data.addr+'</span></p>'
						);
						menuOrderAmount.html(
									'<p>菜品总价:&nbsp;&nbsp;<span>￥'+stringModule.amountFen2Yuan(res.data.foodTotalPrice,2)+'</span></p>'+
									'<p>配送费用:&nbsp;&nbsp;<span>￥'+stringModule.amountFen2Yuan(res.data.sendAmount,2)+'</span></p>'+
									'<p>订单总价:&nbsp;&nbsp;<span style="font-weight: bold;">￥'+stringModule.amountFen2Yuan(res.data.orderTotalPrice,2)+'</span></p>'
						);
					}else{
						alertWidth = 600;
						alertTitle = '<h4 class="center alert-title">提示</h4>';
				        alertContent = '<div class="alert-content"> ' +
				        					'<p class="center">'+ res.msg +'</p>'+	 									        					
				        				'</div>';
				        alertBtn = [
					        	{
									html: "知道了",
									"class" : "alert-btn",
									click: function() {
										$(this).dialog( "close" );
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
		}
	};
	main.init();
});