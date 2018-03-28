$(function() {

	var userId = sessionStorage.userId,
		onLine = sessionModule.isLogin(sessionStorage.userId),
		tableEle = $("#lists"),
		checkBtn = $("#checkMes"),
		resetBtn = $("#reset-btn"),
		exportBtn = $("#exportBtn"),
		addBtn = $("#add-btn"),
		checkItemClass = $(".check-item"),
		checkSceClass = $("#alertBox .check-scene"),
		addStatus = "N",//N代表是添加，Y代表是修改
		typeId = "",//记录选择的数据ID
		page = 1, //页码
	main = {
		//初始化
		init: function() {
			if(stringModule.CheckEmpty(onLine)) { // 判断用户是否处于登陆状态
				return false;
			}
			var self = this;
			self.dataInit();
			self.bindEvent();
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
            
            // 添加分类
            addBtn.bind("click",function(){
            	addStatus = "N";
            	self.addOrUpdate();
            });
            
            // table列表编辑序号
            tableEle.on("click","#no_edit_typeIndex",function(){
            	var value = $(this).next("#edit_typeIndex").val();
            	$(this).next("#edit_typeIndex").removeClass("hidden").val("").focus().val(value);
            	$(this).addClass("hidden");
            });
            tableEle.on("blur","#edit_typeIndex",function(){
            	
            	var inputTypeIndex = $(this);
            	var spanTypeIndex = $(this).prev("#no_edit_typeIndex");
            	var newTypeIndex = inputTypeIndex.val();
            	var checkFlag = stringModule.regexpRule("number",newTypeIndex,"");
            	if(newTypeIndex == "" || checkFlag.result){
            		var longTypeIndex = spanTypeIndex.attr("value");
	            	var typeId = spanTypeIndex.attr("typeId");
	            	spanTypeIndex.removeClass("hidden")
	            	inputTypeIndex.addClass("hidden");
	            	if(newTypeIndex != longTypeIndex){
	            		var obj = {
		            		typeId:typeId,
		            		typeIndex: newTypeIndex
		            	}
		            	$.ajax({
							headers: {
						        Accept:"application/json",						        
						    },
							type: "POST",
							url: shopIp + "wxdc-mgr-service/wxdc/sortFoodType",
							contentType: "application/json; charset=utf-8",
							data: JSON.stringify(obj),
							async: true,
							dataType: "json",
							success: function (res) {
								/*if(res.code == "200"){
									spanTypeIndex.html(newTypeIndex);
									spanTypeIndex.attr("value",newTypeIndex);
									inputTypeIndex.attr("value",newTypeIndex);
								}else{
									inputTypeIndex.attr("value",longTypeIndex);
									inputTypeIndex.val(longTypeIndex);
								}*/
								alertWidth = 600;
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
													$(this).dialog( "close" );
													tableEle.bootstrapTable('refreshOptions',{pageNumber:1,pageSize:10});
												}
											}
										]
							        exports.alertBox("alertBox",alertTitle,alertContent,alertBtn,alertWidth);
								}else{
									inputTypeIndex.attr("value",longTypeIndex);
									inputTypeIndex.val(longTypeIndex);
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
            	}else{
            		var longTypeIndex = spanTypeIndex.attr("value");
            		spanTypeIndex.removeClass("hidden");
            		inputTypeIndex.val(longTypeIndex);
            		inputTypeIndex.addClass("hidden");  
            		
            		alertTitle = '<h4 class="center alert-title">提示</h4>';
			        alertContent = '<div class="alert-content"> ' +
			        					'<p class="center">请输入正确的数值格式</p>'+	 									        					
			        				'</div>';
			       	alertWidth = 600;
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
            
		},
		// 初始化数据
		dataInit: function() {
			var bsTable = {};
			// 查询条件
			bsTable.paramsGroup = function(params) {
				var existData = {
					pageSize: params.limit,
					currentPage: params.offset / params.limit + 1,
					typeName: $.trim($("#typeName").val()),
					status: $.trim($("#status").val()),
					queryType:1
				}
				return existData;
			};
			// 封装返回数据
			bsTable.resHandler = function(res) {
				if(res.code == "200") {
					resultData = res;
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
					field: 'typeId',
					title: '分类编码',
					align: 'center'
				}, {
					field: 'typeName',
					title: '分类名称',
					align: 'center'
				}, {
					field: 'status',
					title: '状态',
					align: 'center',
					formatter:function(value,row,index){
						if(value == "0"){
							return "停用";
						}else if(value == "1"){
							return "启用";
						}else {
							return "未知";
						}
					}
				},{
					field: 'typeIndex',
					title: '显示顺序',
					align: 'center',
					width: "54",
					formatter:function(value,row,index){
						var typeIndex = value == null?"":value;
						return "<span id='no_edit_typeIndex' typeId="+row.typeId+" value="+typeIndex+">"+typeIndex+"</span><input type='text' id='edit_typeIndex' class='hidden' value="+typeIndex+">";
					}
				}, {
					field: 'mark',
					title: '备注说明',
					align: 'center'
				}, {
					field: 'merchantName',
					title: '操作',
					formatter: function(value, row, index) {
						var handleHtml = '<div class="oper">'+
												'<a class="btn-table update" href="javascript:void(0)">修改</a>'+
												'<a class="btn-table delete" href="javascript:void(0)">删除</a>'+
										'</div>';
						return handleHtml;
					},
					events: 'operateEvents'
				}],
				height:500,
				editable:true,//开启编辑模式
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
				url: shopIp + "wxdc-mgr-service/wxdc/queryFoodType"
			});
		},
		//添加修改方法
		addOrUpdate:function(){
			var self = this;
			var dataRes = "";
			if(addStatus == "Y"){
				dataRes = "pass";
			}else{
				dataRes = "lock";
			}
			alertTitle = '<h4 class="center alert-title">添加菜品分类</h4>';
			alertContent = '<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">分类编码:</label>'+
								'<div class="col-xs-12 col-sm-5">'+
									'<span class="block input-icon input-icon-right">'+
										'<p id="jst-typeId" name="typeId" class="width-100 check-param check-scene" style="height:34px;line-height: 34px;"></p>'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips"></div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">分类名称:</label>'+
								'<div class="col-xs-12 col-sm-5">'+
									'<span class="block input-icon input-icon-right">'+
										'<input type="text" id="jst-typeName" name="typeName" class="width-100 check-item check-param check-scene" placeholder="请输入分类名称" data-type="must" data-res="'+dataRes+'" maxlength="5" data-info="请输入正确的分类名称">'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips">*</div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">显示顺序:</label>'+
								'<div class="col-xs-12 col-sm-5">'+
									'<span class="block input-icon input-icon-right">'+
										'<input type="text" id="jst-typeIndex" name="typeIndex" class="width-100 check-item check-param check-allow check-scene" placeholder="请输入显示顺序" data-type="must" data-res="pass" data-info="请输入正确的显示顺序">'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips"></div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">备注说明:</label>'+
								'<div class="col-xs-12 col-sm-5">'+
									'<span class="block input-icon input-icon-right">'+
										'<textarea type="text" id="jst-mark" name="mark" class="width-100 check-item check-param check-allow check-scene" placeholder="请输入备注说明" data-type="must" data-res="pass" data-info="请输入正确的备注说明"></textarea>'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips"></div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">状态:</label>'+
								'<div class="col-xs-12 col-sm-5">'+
									'<span class="block input-icon input-icon-right">'+
										'<select id="jst-status" name="status" class="width-100 check-item check-param check-allow check-scene" data-type="must" data-res="pass" data-info="请选择正确的状态">'+
											'<option value="1">启用</option>'+
											'<option value="0">停用</option>'+
										'</select>'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips"></div>'+
						'</div>';
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
									url = "wxdc-mgr-service/wxdc/updateFoodType";
								}else{
									url = "wxdc-mgr-service/wxdc/addFoodType";
								}
								var obj = {
									typeId: $.trim($("#jst-typeId").html()),
									typeName: $.trim($("#jst-typeName").val()),
									typeIndex: $.trim($("#jst-typeIndex").val()),
									status: $.trim($("#jst-status").val()),
									mark: $.trim($("#jst-mark").val())
								}
								$.ajax({
									headers: {
								        Accept:"application/json",						        
								    },
									type: "POST",
									url: shopIp + url,
									contentType: "application/json",
									data: JSON.stringify(obj),
									async: true,
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
							}else{
								self.validateDeal($("#" + theResult.eid), false, $("#" + theResult.eid).attr("data-info"), true);
							}
						}
					},
				];
			exports.alertBox("alertBox",alertTitle,alertContent,alertBtn,alertWidth);
			
			/*如果是修改，根据ID去查询数据，如果不是修改，请求后台获取分类编码*/
			if(addStatus == "Y"){
				var objData = {
							typeId: typeId,
							queryType: "1"
						  };
				$.ajax({
					headers: {
				        Accept:"application/json",						        
				    },
					type: "POST",
					url: shopIp + "wxdc-mgr-service/wxdc/queryFoodType",
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(objData),
					async: true,
					dataType: "json",
					success: function (res) {
						var resultData = res.data.list[0];
						$("#jst-typeId").html(resultData.typeId);
						$("#jst-typeName").val(resultData.typeName);
						$("#jst-typeIndex").val(resultData.typeIndex == null?"":resultData.typeIndex);
						$("#jst-mark").val(resultData.mark);
						$("#jst-status").find("option[value="+resultData.status+"]").attr("selected","selected");
					},
					error: function () {
						alert("服务未开启");
					}
				});
			}else{
				$.ajax({
					headers: {
				        Accept:"application/json",						        
				    },
					type: "POST",
					url: shopIp + "wxdc-mgr-service/wxdc/queryTypeId",
					contentType: "application/json; charset=utf-8",
					data: {},
					async: true,
					dataType: "json",
					success: function (res) {
						if(res.code == "200"){
							$("#jst-typeId").html(res.data);
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
		},
		//删除菜品分类
		deleteFoodType:function(typeId){
			var obj = {typeId:typeId}
			$.ajax({
					headers: {
				        Accept:"application/json",						        
				    },
					type: "POST",
					url: shopIp + "wxdc-mgr-service/wxdc/deleteFoodType",
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(obj),
					async: true,
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
			typeId = row.typeId;
			main.addOrUpdate();
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
									main.deleteFoodType(row.typeId);
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

