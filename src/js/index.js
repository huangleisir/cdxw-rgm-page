$(function() {

	var userId = sessionStorage.userId,
		onLine = sessionModule.isLogin(sessionStorage.userId),
		tableEle = $("#lists"),
		checkBtn = $("#checkMes"),
		resetBtn = $("#reset-btn"),
		exportBtn = $("#exportBtn"),
		page = 1, //页码
	main = {
		//初始化
		init: function() {
			if(stringModule.CheckEmpty(onLine)) { // 判断用户是否处于登陆状态
				return false;
			}
			var self = this;
			self.datePicker();
			self.dataInit();
			self.bindEvent();
		},
		//事件绑定
		bindEvent: function() {

			// 查询按钮，重新向服务器发起请求
			checkBtn.bind("click", function() {		
				tableEle.bootstrapTable('refreshOptions',{pageNumber:1,pageSize:10});
			});
			
			// 重置查询条件(刷新页面)
            resetBtn.bind("click", function() {
            	window.location.href = window.location.href;
            });
            
            // 导出
            exportBtn.bind("click", function(){
            	var obj = {
            		pageSize: 10,
					currentPage: 1,
					id: $.trim($("#id").val()),
					name: $.trim($("#name").val()),
					mobile: $.trim($("#mobile").val()),
					payType: $.trim($("#payType").val()),
					payStatus: $.trim($("#payStatus").val()),
					printStatus: $.trim($("#printStatus").val()),
					sendStatus: $.trim($("#sendStatus").val()),
					startTimes: $("#startTime").val(),
					endTimes: $("#endTime").val()
            	};
            	$.ajax({
					headers: {
				        Accept:"application/json",						        
				    },
					type: "POST",
					url: shopIp + "wxdc-mgr-service/wxdc/queryOrder",
					contentType: "application/json",
					data: JSON.stringify(obj),
					async: true,
					dataType: "json",
					success: function (res) {
						if(res.data.list != undefined && res.data.list.length > 0){
							var param1 = "?id="+$.trim($("#id").val())+"&name="+$.trim($("#name").val())+"&mobile="+$.trim($("#mobile").val())+"&payType="+$.trim($("#payType").val())+"&payStatus="+$.trim($("#payStatus").val());
				            var param2 = "&printStatus="+$.trim($("#printStatus").val())+"&sendStatus="+$.trim($("#sendStatus").val())+"&startTimes="+$("#startTime").val()+"&endTimes="+$("#endTime").val();
				            window.location.href = shopIp + "wxdc-mgr-service/wxdc/downloadOrder"+param1+param2;
						}else{
							alertWidth = 600;
							alertTitle = '<h4 class="center alert-title">提示</h4>';
					        alertContent = '<div class="alert-content">' +
					        					'<p class="center">暂无数据可导出</p>'+	 									        					
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
            });
            
		},
		// 初始化时间选择器
		datePicker: function() {
			//开始时间
			$("#startTime").datepicker({
				language: "zh-CN",
				format: "yyyy-mm-dd",
				autoclose: true
			}).next().on(ace.click_event, function() {
				$(this).prev().focus();
			});
			//结束时间
			$("#endTime").datepicker({
				language: "zh-CN",
				format: "yyyy-mm-dd",
				autoclose: true
			}).next().on(ace.click_event, function() {
				$(this).prev().focus();
			});
			// 设置时间选择范围
			$("#startTime").on("hide", function() {
				$("#endTime").datepicker('setStartDate', $(this).val());
			});
			$("#endTime").on("hide", function() {
				$("#startTime").datepicker('setEndDate', $(this).val());
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
					id: $.trim($("#id").val()),
					name: $.trim($("#name").val()),
					mobile: $.trim($("#mobile").val()),
					payType: $.trim($("#payType").val()),
					payStatus: $.trim($("#payStatus").val()),
					printStatus: $.trim($("#printStatus").val()),
					sendStatus: $.trim($("#sendStatus").val()),
					startTimes: $("#startTime").val(),
					endTimes: $("#endTime").val()
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
					field: 'id',
					title: '订单编号',
					align: 'center'
				}, {
					field: 'createTime',
					title: '下单时间',
					align: 'center'
				},{
					field: 'foodAmount',
					title: '订单金额(元)',
					align: 'center',
					formatter:function(value,row,index){
						return stringModule.amountFen2Yuan(value,2);
					}
				}, {
					field: 'name',
					title: '姓名',
					align: 'center'
				},{
					field: 'mobile',
					title: '手机号码',
					align: 'center'
				}, {
					field: 'addr',
					title: '地址',
					align: 'center'
				}, {
					field: 'payType',
					title: '支付方式',
					align: 'center',
					formatter: function(value,row,index){
						if(value == "1"){
							return "一卡通在线支付";
						}else if(value == "2"){
							return "餐到付款";
						}
					}
				}, {
					field: 'payStatus',
					title: '支付状态',
					align: 'center',
					formatter: function(value,row,index) {
						if(value == "0"){
							return "未支付";
						}else if(value == "1"){
							return "已支付";
						}else if(value == "2"){
							return "已关闭";
						}
					}
				}, {
					field: 'printStatus',
					title: '打印状态',
					align: 'center',
					formatter: function(value,row,index) {
						if(value == "0"){
							return "未打印";
						}else if(value == "1"){
							return "已打印";
						}
					}
				}, {
					field: 'sendStatus',
					title: '配送状态',
					align: 'center',
					formatter: function(value,row,index) {
						if(value == "0"){
							return "未确认";
						}else if(value == "1"){
							return "已确认";
						}else if(value == "2"){
							return "已配送";
						}
					}
				}, {
					field: '',
					title: '操作',
					formatter: function(value, row, index) {
						var handleHtml = '<div class="oper">'+
												'<a class="btn-table details" href="order_details.html?id='+row.id+'">详情</a>';
												/*'<a class="btn-table" href="javascript:void(0)">打印配送单</a>';*/
						if(row.sendStatus == "1"){
							handleHtml += '<a class="btn-table finish" href="javascript:void(0)">完成</a>';
						}
						/*if(row.sendStatus == "0" || row.sendStatus == "2"){
							handleHtml += '<a class="btn-table" href="javascript:void(0)">取消</a>';
						}*/
						handleHtml += "</div>";	
						return handleHtml;
					},
					events: 'operateEvents'
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
				url: shopIp + "wxdc-mgr-service/wxdc/queryOrder"
			});
		}
	};
	main.init();
	
	//注册单击事件
	window.operateEvents = {
		'click .finish': function (e, value, row, index) {
			var obj = {
				id:row.id,
				sendStatus: row.sendStatus
			}
			$.ajax({
					headers: {
				        Accept:"application/json",						        
				    },
					type: "POST",
					url: shopIp + "wxdc-mgr-service/wxdc/updateOrderStatus",
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(obj),
					async: true,
					dataType: "json",
					success: function (res) {
						alertWidth = 500;
						if(res.code == "200"){
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
											tableEle.bootstrapTable('refreshOptions',{pageNumber:1,pageSize:10});
										}
									}
								]
					        exports.alertBox("alertBox",alertTitle,alertContent,alertBtn,alertWidth);
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
		}		
	}
});

