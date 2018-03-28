$(function() {

	var userId = sessionStorage.userId,
		onLine = sessionModule.isLogin(sessionStorage.userId),
		tableEle = $("#lists"),
		checkBtn = $("#checkMes"),
		resetBtn = $("#reset-btn"),
		exportBtn = $("#exportBtn"),
		addBtn = $("#add-btn"),
		foodType = $("#foodType"),
		alertBox = $("#alertBox"),
		addStatus = "N",//N代表是添加，Y代表是修改
		selectedFoodId = "",//当前选中的菜品
		page = 1, //页码
	main = {
		//初始化
		init: function() {
			if(stringModule.CheckEmpty(onLine)) { // 判断用户是否处于登陆状态
				return false;
			}
			var self = this;
			var classify = self.getClassify();
			var optionHtml = "<option value=''>全部</option>";
			foodType.html(optionHtml+classify);
			self.dataInit();
			self.bindEvent();
		},
		//初始化菜品分类下拉宽
		getClassify: function(){
			var foodTypes = "";
			var obj = {queryType:0};
			$.ajax({
				headers: {
			        Accept:"application/json",						        
			    },
				type: "POST",
				url: shopIp + "wxdc-mgr-service/wxdc/queryFoodType",
				contentType: "application/json",
				data: JSON.stringify(obj),
				async: false,
				dataType: "json",
				success: function (res) {
					if(res.code == "200"){
						for(var i=0;i<res.data.length;i++){
							foodTypes += "<option value="+res.data[i].typeId+">"+res.data[i].typeName+"</option>";
						}
					}else{
						var alertWidth = 500;
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
					}
				},
				error: function () {
					alert("服务未开启");
				}
			});
			return foodTypes;
		},
		//保留两位小数
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
		//事件绑定
		bindEvent: function() {
			var self = this;
			// 查询按钮，重新向服务器发起请求
			checkBtn.bind("click", function() {		
				tableEle.bootstrapTable('refreshOptions',{pageNumber:1,pageSize:10});
			});
			
			// 重置查询条件(刷新页面)
            resetBtn.bind("click", function() {
            	window.location.href = window.location.href;
            });
            
            // 添加菜品
            addBtn.bind("click",function(){
            	addStatus = "N";
            	self.addOrUpdateDishes();
            });
                        
            // 金额处理事件
            alertBox.on("change","#jst-salePrice,#jst-oldPrice",function(){
            	$(this).val(self.returnFloat($(this).val()));
            });
            
             // 焦点离开时校验
            $("#alertBox").on("blur",".check-item",function(){
            	if($(this).hasClass("check-allow")) {
					if(stringModule.CheckEmpty($(this).val())) {
						self.validateValue($(this));
					} else {
						self.validateDeal($(this), true, "ok", false);
					}
				} else {
					self.validateValue($(this));
				}
           });
            
            // 导出菜品
            exportBtn.bind("click",function(){
            	var obj = {
            		pageSize: 10,
					currentPage: 1,
					foodId: $.trim($("#foodId").val()),
					foodName: $.trim($("#foodName").val()),
					typeId: $.trim($("#foodType").val()),
					status: $.trim($("#status").val())
            	};
            	$.ajax({
					headers: {
				        Accept:"application/json",						        
				    },
					type: "POST",
					url: shopIp + "wxdc-mgr-service/wxdc/queryFood",
					contentType: "application/json",
					data: JSON.stringify(obj),
					async: true,
					dataType: "json",
					success: function (res) {
						if(res.data.list != undefined && res.data.list.length > 0){
							var param1 = "?foodId="+$.trim($("#foodId").val())+"&foodName="+$.trim($("#foodName").val())+"&typeId="+$.trim($("#foodType").val())+"&status="+$.trim($("#status").val());
				            window.location.href = shopIp + "wxdc-mgr-service/wxdc/downloadFood"+param1;
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
		// 初始化数据
		dataInit: function() {
			var bsTable = {};
			// 查询条件
			bsTable.paramsGroup = function(params) {
				var obj = {
					pageSize: params.limit,
					currentPage: params.offset / params.limit + 1,
					foodId: $.trim($("#foodId").val()),
					foodName: $.trim($("#foodName").val()),
					typeId: $.trim($("#foodType").val()),
					status: $.trim($("#status").val())
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
					field: 'foodId',
					title: '菜品编码',
					align: 'center'
				}, {
					field: 'foodName',
					title: '菜品名称',
					align: 'center',
				}, {
					field: 'typeName',
					title: '分类',
					align: 'center'
				},{
					field: 'picPath',
					title: '图片',
					align: 'center',
					formatter: function(value,row,index){
						return "<div><img style='width:50px;height:50px;' src="+row.picPath+" /></div>";
					}
				}, {
					field: 'salePrice',
					title: '售价(元)',
					align: 'center',
					formatter: function(value,row,index){
						return stringModule.amountFen2Yuan(value,2);
					}
				}, {
					field: 'oldPrice',
					title: '原价(元)',
					align: 'center',
					formatter: function(value,row,index){
						return stringModule.amountFen2Yuan(value,2);
					}
				}, {
					field: 'status',
					title: '状态',
					align: 'center',
					formatter: function(value,row,index){
						if(value == "1"){
							return "正常";
						}else if(value == "2"){
							return "售罄";
						}
					}
				}, {
					field: 'mark',
					title: '说明',
					align: 'center'
				}, {
					field: '',
					title: '操作',
					formatter: function(value, row, index) {
						var handleHtml = '<div class="oper">'+
												'<a class="btn-table update" href="javascript:void(0)">修改</a>'+
												'<a class="btn-table delete" href="javascript:void(0)">删除</a>';
						if(row.status == "1"){
							handleHtml += '<a class="btn-table sellout" href="javascript:void(0)">沽清</a>';
						}else{
							handleHtml += '<a class="btn-table relieveSellout" href="javascript:void(0)">解除沽清</a>';
						}
						handleHtml += '</div>';
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
				url: shopIp + "wxdc-mgr-service/wxdc/queryFood"
			});
		},
		// 添加菜品
		addOrUpdateDishes: function(){
			var self = this;
			var dataRes = "";
			if(addStatus == "Y"){
				dataRes = "pass";
			}else{
				dataRes = "lock";
			}
			alertTitle = '<h4 class="center alert-title">添加菜品</h4>';
			alertContent = '<form id="jst-foodForm"><div class="form-group">'+
								'<label class="col-xs-12 col-sm-5 col-md-3 control-label no-padding-right">菜品分类:</label>'+
								'<div class="col-xs-12 col-sm-6">'+
									'<span class="block input-icon input-icon-right">'+
										'<select id="jst-typeId" name="typeId" class="width-100">'+
										'</select>'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips"></div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">菜品编码:</label>'+
								'<div class="col-xs-12 col-sm-6">'+
									'<span class="block input-icon input-icon-right">'+
										'<p id="jst-foodId" name="foodId" class="width-100" style="height:34px;line-height: 34px;"></p>'+
										'<input type="text" id="jsts-foodId" name="foodId" class="hidden">'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips"></div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">菜品名称:</label>'+
								'<div class="col-xs-12 col-sm-6">'+
									'<span class="block input-icon input-icon-right">'+
										'<input type="text" id="jst-foodName" name="foodName" class="width-100 check-item check-param check-scene" placeholder="请输入菜品名称" data-type="must" data-res="'+dataRes+'" maxlength="15" data-info="请输入正确的菜品名称">'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips">*</div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">菜品售价(元):</label>'+
								'<div class="col-xs-12 col-sm-6">'+
									'<span class="block input-icon input-icon-right">'+
										'<input type="text" id="jst-salePrice" name="salePrice" class="width-100 check-item check-param check-scene" placeholder="请输入菜品售价" data-type="float2" data-res="'+dataRes+'" data-info="请输入正确的菜品售价">'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips">*</div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">菜品原价(元):</label>'+
								'<div class="col-xs-12 col-sm-6">'+
									'<span class="block input-icon input-icon-right">'+
										'<input type="text" id="jst-oldPrice" name="oldPrice" class="width-100 check-item check-param check-scene" placeholder="请输入菜品原价" data-type="float2" data-res="'+dataRes+'" data-info="请输入正确的菜品原价">'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips">*</div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">备注说明:</label>'+
								'<div class="col-xs-12 col-sm-6">'+
									'<span class="block input-icon input-icon-right">'+
										'<textarea id="jst-mark" name="mark" class="width-100 check-item check-param check-allow check-scene" placeholder="请输入备注说明" data-type="must" data-res="pass" data-info="请输入正确的备注说明"></textarea>'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips"></div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">菜品图片:</label>'+
								'<div class="col-xs-12 col-sm-6">'+
									'<div id="jst-showImg" style="width:100px;height:100px" class="hide"></div>'+
									'<span class="block input-icon input-icon-right"><input id="jst-picPath" name="picPaths" class="reg-imgupload check-item check-param check-scene hidden" type="file" data-type="must" data-res="'+dataRes+'" data-info="请上传图片" accept="image/gif,image/jpeg,image/x-png" /></span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips">*</div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">推荐标识:</label>'+
								'<div class="col-xs-12 col-sm-8">'+
									'<span class="block input-icon input-icon-right">'+
										'<div class="radio"><label><input name="commendMark" type="radio" class="ace" value="1"><span class="lbl">招牌菜</span></label></div>'+
										'<div class="radio"><label><input name="commendMark" type="radio" class="ace" value="2"><span class="lbl">今日特价</span></label></div>'+
										'<div class="radio"><label><input name="commendMark" type="radio" class="ace" value="3"><span class="lbl">特别推荐</span></label></div>'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips"></div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">口 &nbsp;&nbsp;&nbsp;&nbsp;味:</label>'+
								'<div class="col-xs-12 col-sm-8">'+
									'<span class="block input-icon input-icon-right">'+
										'<div class="radio"><label><input name="spiceLevel" type="radio" class="ace" value="3"><span class="lbl">多辣</span></label></div>'+
										'<div class="radio"><label><input name="spiceLevel" type="radio" class="ace" value="2"><span class="lbl">少辣</span></label></div>'+
										'<div class="radio"><label><input name="spiceLevel" type="radio" class="ace" value="1"><span class="lbl">微辣</span></label></div>'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips"></div>'+
						'</div></form>';
		    alertWidth = 600;
			alertBtn = [
					{
						html: "确认",
						"class" : "alert-btn",
						click: function() {
							var theResult = self.validateScene($(".check-scene"));
							if(theResult.res){
								var url = "";
								if(addStatus == "Y"){
									$("#jst-typeId").removeAttr("disabled");
									url = "wxdc-mgr-service/wxdc/updateFood";
								}else{
									url = "wxdc-mgr-service/wxdc/addFood";
								}
								$.ajax({
									type: "POST",
									url: shopIp + url,
									xhr: function() {
										myXhr = $.ajaxSettings.xhr();
										return myXhr;
									},
									data: new FormData($("#jst-foodForm")[0]),
									async: true,
									dataType: "json",
									success: function (res) {
										if(res.resCode == "200"){
											alertTitle = '<h4 class="center alert-title">提示</h4>';
									        alertContent = '<div class="alert-content"> ' +
									        					'<p class="center">'+ res.msgContent +'</p>'+	 									        					
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
									        					'<p class="center">'+ res.msgContent +'</p>'+	 									        					
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
									},
									contentType: false,
	        						processData: false
								});
							}else{
								self.validateDeal($("#" + theResult.eid), false, $("#" + theResult.eid).attr("data-info"), true);
							}
						}
					},
				];
			exports.alertBox("alertBox",alertTitle,alertContent,alertBtn,alertWidth);
			
			//初始化图片上传
			$("#jst-picPath").ace_file_input({
				style: 'well',
				btn_choose: '请 上 传 您 的 图 片',
				btn_change: null,
				no_icon: 'icon-cloud-upload',
				droppable: true,
				thumbnail: 'small', // 上传前缩略图展示 large | fit 
				//,icon_remove:null//set null, to hide remove/reset button
				/*,before_change:function(files, dropped) {
					//Check an example below
					//or examples/file-upload.html
					return true;
				}*/
				before_remove: function() {
					if($(this).hasClass("check-allow")) {
						self.validateDeal($(this), true, "*", false);
					} else {
						self.validateDeal($(this), false, $(this).attr("data-info"), false);
					}
					return true;
				},
				preview_error: function(filename, error_code) {
					//name of the file that failed
					//error_code values
					//1 = 'FILE_LOAD_FAILED',
					//2 = 'IMAGE_LOAD_FAILED',
					//3 = 'THUMBNAIL_FAILED'
					//alert(error_code);
				},
				before_change: function(files, dropped) {
					//files is a "File" object array in modern browsers
					//files is a "string" (file name) array in older browsers
					//dropped=true if files are drag & dropped
					var maxFileNum = files.length < 2 ? files.length : 2; // 最多只能上传2张图片
					var maxFileSize = 2 * 1000 * 1000; // 每张图片不能超过2M
					var resFile = true;

					if(files.length > 2) {
						alert("抱歉，最多只能上传2张图片");
						return false;
					} else {
						for(var i = 0; i < maxFileNum; i++) {
							if(files[i].size > maxFileSize) {
								resFile = false;
							}
						}
						// 验证是否已经上传图片
						if(resFile) {
							$("#jst-showImg").addClass("hide");//隐藏图片展示
							if($(this).hasClass("check-allow")) {
								if(files.length > 0) {
									self.validateDeal($(this), true, "ok", false);
								} else {
									self.validateDeal($(this), true, "(非必填)", false);
								}
							} else {
								if(files.length > 0) {
									self.validateDeal($(this), true, "ok", false);
								} else {
									self.validateDeal($(this), false, $(this).attr("data-info"), false);
								}
							}
							
							return files;
						} else {
							alert("每张图片不能超过2M");
							return false;
						}
					}
				}
			});
			
			//获取菜品分类列表
			var optionHtml = self.getClassify();
			$("#jst-typeId").html(optionHtml);
			
			//获取菜品分类
			if(addStatus == "N"){
				var foodId = self.getFoodId($("#jst-typeId").val());
				$("#jst-foodId").html(foodId);
				$("#jsts-foodId").val(foodId);
				
				// 切换菜品分类，重新获取菜品编码
            	$("#jst-typeId").bind("change",function(){
            		var foodId = self.getFoodId($(this).val());
	            	$("#jst-foodId").html(foodId);
	            	$("#jsts-foodId").val(foodId);
            	});
			}else{//获取菜品详情
				$.ajax({
					headers: {
				        Accept:"application/json",						        
				    },
					type: "POST",
					url: shopIp + "wxdc-mgr-service/wxdc/queryFood",
					contentType: "application/json",
					data: JSON.stringify({foodId:selectedFoodId}),
					async: false,
					dataType: "json",
					success: function (res) {
						var data = res.data.list[0];
						/*$("#jst-typeId").attr("disabled","true");*/
						$("#jst-typeId").find("option[value="+data.typeId+"]").attr("selected","selected");
						$("#jst-foodId").html(data.foodId);
						$("#jsts-foodId").val(data.foodId);
						$("#jst-foodName").val(data.foodName);
						$("#jst-salePrice").val(stringModule.amountFen2Yuan(data.salePrice,2));
						$("#jst-oldPrice").val(stringModule.amountFen2Yuan(data.oldPrice,2));
						$("#jst-mark").val(data.mark);
						$("input:radio[name='commendMark'][value="+data.commendMark+"]").prop('checked','true');
						$("input:radio[name='spiceLevel'][value="+data.spiceLevel+"]").prop('checked','true');
						$("#jst-showImg").removeClass("hide").html("<img style='width:100%;height:100%;' src="+data.picPath+" />");
					},
					error: function () {
						alert("服务未开启");
					}
				});
			}
		},
		// 获取菜品编码
		getFoodId: function(typeId){
			var foodId = "";
			$.ajax({
				headers: {
			        Accept:"application/json",						        
			    },
				type: "POST",
				url: shopIp + "wxdc-mgr-service/wxdc/queryFoodId",
				contentType: "application/json",
				data: JSON.stringify({typeId:typeId}),
				async: false,
				dataType: "json",
				success: function (res) {
					if(res.code == "200"){
						foodId = res.data;
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
			return foodId;
		},
		//删除菜品
		deleteFood: function(foodId){
			$.ajax({
				headers: {
			        Accept:"application/json",						        
			    },
				type: "POST",
				url: shopIp + "wxdc-mgr-service/wxdc/deleteFood",
				contentType: "application/json",
				data: JSON.stringify({foodId:foodId}),
				async: false,
				dataType: "json",
				success: function (res) {
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
				        exports.alertBox("deleteAlertBox",alertTitle,alertContent,alertBtn,alertWidth);
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
				        exports.alertBox("deleteAlertBox",alertTitle,alertContent,alertBtn,alertWidth);
					}
				},
				error: function () {
					alert("服务未开启");
				}
			});
		},
		//沽清接口和接触沽清
		selloutFood: function(foodId,status){
			$.ajax({
				headers: {
			        Accept:"application/json",						        
			    },
				type: "POST",
				url: shopIp + "wxdc-mgr-service/wxdc/updateFoodStatus",
				contentType: "application/json",
				data: JSON.stringify({
					foodId:foodId,
					status:status
				}),
				async: false,
				dataType: "json",
				success: function (res) {
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
				        exports.alertBox("deleteAlertBox",alertTitle,alertContent,alertBtn,alertWidth);
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
				        exports.alertBox("deleteAlertBox",alertTitle,alertContent,alertBtn,alertWidth);
					}
				},
				error: function () {
					alert("服务未开启");
				}
			});
		},// 检验场景下的所有字段是否合法
		validateScene: function(sce) {
			var baseData = [];
			var lockItem;
			formResult = true;
			// 获取需要验证的input要素
			sce.each(function() {
				var theData = {
					eid: this.id,
					type: $(this).attr("data-type"),
					res: $(this).attr("data-res")
				};
				baseData.push(theData);
			});
			// 校验全部字段是否通过验证
			$.each(baseData, function(key, val) {
				if(val.res == "lock") {
					formResult = false;
					lockItem = val.eid;
					return false;
				}
			});
			return {
				res: formResult,
				eid: lockItem
			};
		},
		// 验证当前字段
		validateValue: function(ele, elesib) {
			var self = this;
			var theValue = ele.val();
			var theType = ele.attr("data-type");
			var theInfo = ele.attr("data-info");
			var theRes = stringModule.regexpRule(theType, theValue, theInfo);
			// 校验字段是否通过校验
			if(theRes.result) {
				// 非时间字段
				if(!ele.hasClass("check-datepicker")) { //!ele.hasClass("check-datepicker") && !ele.hasClass("check-bank")
					self.validateDeal(ele, true, theRes.warn, false);
				}
				// 时间字段
				if(stringModule.CheckEmpty(elesib)) {
					var sibRes = stringModule.regexpRule(elesib.attr("data-type"), elesib.val(), elesib.attr("data-info"));
					if(sibRes.result) {
						self.validateDeal(ele, true, theRes.warn, false);
						self.validateDeal(elesib, true, sibRes.warn, false);
					} else {
						self.validateDeal(elesib, false, sibRes.warn, false);
					}
				}
			} else {
				// 非上传图片字段
				if(!ele.hasClass("reg-imgupload")) {
					self.validateDeal(ele, false, theRes.warn, false);
				}
			}
		},
		// 验证字段结果处理
		validateDeal: function(ele, res, tips, scroll) {
			ele.parents(".check-area").find(".check-tips").html(tips);
			if(res) {
				ele.parents(".check-area").removeClass("has-error");
				ele.parents(".check-area").addClass("has-success");
				ele.attr("data-res", "pass");
			} else {
				ele.parents(".check-area").removeClass("has-success");
				ele.parents(".check-area").addClass("has-error");
				ele.attr("data-res", "lock");
				if(scroll) {
					$("html,body").animate({
						scrollTop: ele.offset().top - 100
					}, 500, function() {
						ele.focus()
					});
				}
			}
		}
	};
	main.init();
	
	
	//注册单击事件
	window.operateEvents = {
		'click .update': function (e, value, row, index) {
			addStatus = "Y";
			selectedFoodId = row.foodId;
			main.addOrUpdateDishes();
		},
		'click .delete': function (e, value, row, index) {
			alertTitle = '<h4 class="center alert-title">提示</h4>';
            alertContent = '<div class="alert-content"> ' +
            					'<p class="center">是否确认删除，删除后将无法恢复？</p>'+	 
            					
            				'</div>';
            alertWidth = 500;
            alertBtn = [
							{
								html: "确认",
								"class" : "alert-btn",
								click: function() {
									main.deleteFood(row.foodId);
									$( this ).dialog( "close" );
								}
							},
							{
								html: "取消",
								"class" : "alert-btn",
								click: function() {
									$( this ).dialog( "close" );											
								}
							}
						];
			exports.alertBox("alertBox",alertTitle,alertContent,alertBtn,alertWidth);
		},
		'click .sellout': function(e,value,row,index){
			alertTitle = '<h4 class="center alert-title">提示</h4>';
            alertContent = '<div class="alert-content"> ' +
            					'<p class="center">是否确认沽清！</p>'+	 
            					
            				'</div>';
            alertWidth = 500;
            alertBtn = [
							{
								html: "确认",
								"class" : "alert-btn",
								click: function() {
									main.selloutFood(row.foodId,row.status);
									$( this ).dialog( "close" );
								}
							},
							{
								html: "取消",
								"class" : "alert-btn",
								click: function() {
									$( this ).dialog( "close" );											
								}
							}
						];
			exports.alertBox("alertBox",alertTitle,alertContent,alertBtn,alertWidth);
		},
		'click .relieveSellout': function(e,value,row,index){
			alertTitle = '<h4 class="center alert-title">提示</h4>';
            alertContent = '<div class="alert-content"> ' +
            					'<p class="center">是否确认解除沽清！</p>'+	 
            					
            				'</div>';
            alertWidth = 500;
            alertBtn = [
							{
								html: "确认",
								"class" : "alert-btn",
								click: function() {
									main.selloutFood(row.foodId,row.status);
									$( this ).dialog( "close" );
								}
							},
							{
								html: "取消",
								"class" : "alert-btn",
								click: function() {
									$( this ).dialog( "close" );											
								}
							}
						];
			exports.alertBox("alertBox",alertTitle,alertContent,alertBtn,alertWidth);
		}
	}
});