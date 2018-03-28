$(function() {

	var userId = sessionStorage.userId,
		onLine = sessionModule.isLogin(sessionStorage.userId),
		tableEle = $("#lists"),
		checkBtn = $("#checkMes"),
		resetBtn = $("#reset-btn"),
		addBtn = $("#add-btn"),
		addStatus = "N",//N代表是添加，Y代表是修改
		id = "",//用来记录修改的用户编号
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
            
            // 新增用户
            addBtn.bind("click",function(){
            	addStatus = "N";
            	self.addOrUpdate();
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
            
            //重置密码格式校验
            $("#alertBox").on("blur","#newPwd,#againNewPwd",function(){
            	var id = $(this).attr("id");
            	if(id == "newPwd"){
            		var checkFlag = stringModule.regexpRule("password",$(this).val(),"");
            		if(checkFlag.result){
            			$("#newPwdErr").html("");
            		}else{
            			$("#newPwdErr").html("请输入6位数字或英文字母、特殊字符");
            		}
            	}else if(id == "againNewPwd"){
            		//1.首先校验密码格式是否正确
            		//2.让后校验密码是否一致
            		var checkFlag = stringModule.regexpRule("password",$(this).val(),"");
            		if(checkFlag.result){
            			$("#againNewPwdErr").html("");
            			if($("#newPwd").val() == $(this).val()){
            				$("#againNewPwdErr").html("");
            			}else{
            				$("#againNewPwdErr").html("密码不一致");
            			}
            		}else{
            			$("#againNewPwdErr").html("请输入6位数字或英文字母、特殊字符");
            		}
            	}
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
					userName: $.trim($("#userName").val()),
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
					field: 'id',
					title: '用户编码',
					align: 'center'
				},{
					field: 'userId',
					title: '用户名',
					align: 'center'
				},{
					field: 'userName',
					title: '用户名称',
					align: 'center'
				},{
					field: 'groups',
					title: '用户群组',
					align: 'center',
					formatter: function(value,row,index){
						if(value == "0"){
							return "管理员";
						}else if(value == "1"){
							return "操作员";
						}else{
							return "未知群组";
						}
					}
				},{
					field: 'sex',
					title: '性别',
					align: 'center',
					formatter: function(value,row,index){
						if(value == "0"){
							return "男";
						}else if(value == "1"){
							return "女";
						}else{
							return "未知性别";
						}
					}
				},{
					field: 'mobile',
					title: '手机号码',
					align: 'center'
				}, {
					field: 'status',
					title: '状态',
					align: 'center',
					formatter: function(value,row,index){
						if(value == "0"){
							return "启用";
						}else if(value == "1"){
							return "禁用";
						}else{
							return "未知状态";
						}
					}
				}, {
					field: 'remark',
					title: '备注',
					align: 'center'
				}, {
					field: '',
					title: '操作',
					formatter: function(value, row, index) {
						var handleHtml = "";
						if(row.groups == "0"){
							handleHtml = '<div class="oper"><a class="btn-table update" href="javascript:void(0)">修改</a></div>';
						}else{
							var btnName = "";
							if(row.status == "0"){
								btnName = "禁用";
							}else{
								btnName = "启用";
							}
							handleHtml = '<div class="oper">'+
											'<a class="btn-table disable" href="javascript:void(0)">'+btnName+'</a>'+
											'<a class="btn-table update" href="javascript:void(0)">修改</a>'+
											'<a class="btn-table delete" href="javascript:void(0)">删除</a>'+
											'<a class="btn-table auth" href="javascript:void(0)">授权</a>';
							if(sessionStorage.id == "01"){
								handleHtml += '<a class="btn-table reset" href="javascript:void(0)">重置密码</a>';
							}
							handleHtml += '</div>';						 
						}
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
				url: shopIp + "wxdc-mgr-service/user/queryUserList"
			});
		},
		//新增用户或修改用户信息
		addOrUpdate: function(){
			var self = this;
			var title = "",dataRes = "";
			if(addStatus == "N"){
				dataRes = "lock";
				title = "添加用户";
			}else{
				dataRes = "pass";
				title = "修改用户";
			}
			alertTitle = '<h4 class="center alert-title">'+title+'</h4>';
			alertContent = '<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">用户编码:</label>'+
								'<div class="col-xs-12 col-sm-5">'+
									'<span class="block input-icon input-icon-right">'+
										'<p id="jst-id" name="id" class="width-100" style="height:34px;line-height: 34px;"></p>'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips"></div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">用户名:</label>'+
								'<div class="col-xs-12 col-sm-5">'+
									'<span class="block input-icon input-icon-right">'+
										'<input type="text" id="jst-userId" name="userId" class="width-100 check-item check-param check-scene" placeholder="请输入全英文的用户名" maxlength="12" data-type="userId" data-res="'+dataRes+'" data-info="请输入正确的用户名">'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips">*</div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">真实姓名:</label>'+
								'<div class="col-xs-12 col-sm-5">'+
									'<span class="block input-icon input-icon-right">'+
										'<input type="text" id="jst-userName" name="userName" class="width-100 check-item check-param check-scene" placeholder="请输入真实姓名" maxlength="8" data-type="name" data-res="'+dataRes+'" data-info="请输入正确的真实姓名">'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips">*</div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">性别:</label>'+
								'<div class="col-xs-12 col-sm-5">'+
									'<span class="block input-icon input-icon-right">'+
										'<div class="radio"><label><input name="sex" type="radio" class="ace" value="0" checked="checked"><span class="lbl">男</span></label></div>'+
										'<div class="radio"><label><input name="sex" type="radio" class="ace" value="1"><span class="lbl">女</span></label></div>'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips"></div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">手机号:</label>'+
								'<div class="col-xs-12 col-sm-5">'+
									'<span class="block input-icon input-icon-right">'+
										'<input type="text" id="jst-mobile" name="mobile" class="width-100 check-item check-param check-scene" placeholder="请输入手机号" data-type="mobile" data-res="'+dataRes+'" data-info="请输入正确的手机号">'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips">*</div>'+
						'</div>'+
						'<div class="form-group check-area check-firstep">'+
								'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">备注:</label>'+
								'<div class="col-xs-12 col-sm-5">'+
									'<span class="block input-icon input-icon-right">'+
										'<textarea type="text" id="jst-remark" name="remark" class="width-100 check-item check-param check-allow check-scene" placeholder="请输入备注说明" data-type="must" data-res="pass" data-info="请输入正确的备注说明"></textarea>'+
									'</span>'+
								'</div>'+
								'<div class="help-block col-xs-12 col-sm-reset inline check-tips"></div>'+
						'</div>';
			if(addStatus == "N"){
				alertContent += '<div class="form-group check-area check-firstep">'+
									'<label class="col-xs-12 col-sm-3 col-md-3 control-label no-padding-right">密码:</label>'+
									'<div class="col-xs-12 col-sm-5">'+
										'<span class="block input-icon input-icon-right">'+
											'<input type="password" id="jst-password" name="password" class="width-100 check-item check-param check-scene" placeholder="请输入6位数字,字母,特殊符号" data-type="password" data-res="'+dataRes+'" data-info="请输入正确的密码">'+
										'</span>'+
									'</div>'+
									'<div class="help-block col-xs-12 col-sm-reset inline check-tips">*</div>'+
								'</div>';
			}
		    alertWidth = 600;
			alertBtn = [
					{
						html: "确认",
						"class" : "alert-btn",
						click: function() {
							var theResult = self.validateScene($(".check-scene"));
							if(theResult.res){
								var url = "",obj = {};
								if(addStatus == "Y"){
									url = "wxdc-mgr-service/user/updateUserInfo";
									obj.id = $.trim($("#jst-id").html());
									obj.userName = $.trim($("#jst-userName").val());
									obj.sex = $.trim($('input[name="sex"]:checked').val());
									obj.mobile = $.trim($("#jst-mobile").val());
									obj.remark = $.trim($("#jst-remark").val());
								}else{
									url = "wxdc-mgr-service/user/addUserInfo";
									obj.id = $.trim($("#jst-id").html());
									obj.userId = $.trim($("#jst-userId").val());
									obj.userName = $.trim($("#jst-userName").val());
									obj.password = exports.encryptPwd($.trim($("#jst-password").val()));
									obj.sex = $.trim($('input[name="sex"]:checked').val());
									obj.mobile = $.trim($("#jst-mobile").val());
									obj.remark = $.trim($("#jst-remark").val());
								}
								/*var obj = {
									id: $.trim($("#jst-id").html()),
									userId: $.trim($("#jst-userId").val()),
									userName: $.trim($("#jst-userName").val()),
									password: exports.encryptPwd($.trim($("#jst-password").val())),
									sex: $.trim($('input[name="sex"]:checked').val()),
									mobile: $.trim($("#jst-mobile").val()),
									remark: $.trim($("#jst-remark").val())
								}*/
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
			
			if(addStatus == "N"){
				// 获取最新用户编号
				$.ajax({
					headers: {
				        Accept:"application/json",						        
				    },
					type: "POST",
					url: shopIp + "wxdc-mgr-service/user/getNewId",
					contentType: "application/json",
					data: {},
					async: true,
					dataType: "json",
					success: function (res) {
						if(res.code == "200"){
							$("#jst-id").html(res.data);
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
				var objData = {id : id}
				// 获取用户详情
				$.ajax({
					headers: {
				        Accept:"application/json",						        
				    },
					type: "POST",
					url: shopIp + "wxdc-mgr-service/user/queryUserList",
					contentType: "application/json",
					data: JSON.stringify(objData),
					async: true,
					dataType: "json",
					success: function (res) {
						var data = res.data.list[0];
						if(res.code == "200"){
							$("#jst-id").html(data.id).attr("disabled","disabled");
							$("#jst-userId").val(data.userId).attr("disabled","disabled");
							$("#jst-userName").val(data.userName);
							$("input:radio[name='sex'][value="+data.sex+"]").prop('checked','true');
							$("#jst-mobile").val(data.mobile);
							$("#jst-remark").val(data.remark);
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
		},//禁用用户或则启用
		startOrDisableUser:function(id,status){
			$.ajax({
				headers: {
			        Accept:"application/json",						        
			    },
				type: "POST",
				url: shopIp + "wxdc-mgr-service/user/startOrDisableUser",
				contentType: "application/json",
				data: JSON.stringify({
					id : id,
					status : status
				}),
				async: true,
				dataType: "json",
				success: function (res) {
					if(res.code == "200"){
						alertTitle = '<h4 class="center alert-title">提示</h4>';
				        alertContent = '<div class="alert-content"> ' +
				        					'<p class="center">'+ res.msg +'</p>'+	 									        					
				        				'</div>';
				        alertWidth = 600;
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
				        alertWidth = 600;
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
		},//删除用户
		deleteUserInfo: function(id){
			$.ajax({
				headers: {
			        Accept:"application/json",						        
			    },
				type: "POST",
				url: shopIp + "wxdc-mgr-service/user/deleteUserInfo",
				contentType: "application/json",
				data: JSON.stringify({
					id : id
				}),
				async: true,
				dataType: "json",
				success: function (res) {
					if(res.code == "200"){
						alertTitle = '<h4 class="center alert-title">提示</h4>';
				        alertContent = '<div class="alert-content"> ' +
				        					'<p class="center">'+ res.msg +'</p>'+	 									        					
				        				'</div>';
				        alertWidth = 600;
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
				        alertWidth = 600;
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
		},//重置密码
		resetPassword:function(id){
			alertTitle = '<h4 class="center alert-title">重置密码</h4>';
			alertContent = '<div class="input-box" style="margin-top:5px;">' + 
							'<div class="input-item">' +
								'<div class="input-lab">*新密码：</div>' +
								'<div class="input-cell" style="width:150px;">'+
									'<input type="password" id="newPwd" placeholder="请输入新密码" maxlength="12"/>'+
								'</div>'+
								'<div class="tips-cell">'+
									'<p class="err-tips" id="newPwdErr"></p>'+
								'</div>'+
							'</div>'+
						'</div>'+
						'<div class="input-box" style="margin-top:5px;">' + 
							'<div class="input-item">' +
								'<div class="input-lab">*确认新密码：</div>' +
								'<div class="input-cell" style="width:150px;">'+
									'<input type="password" id="againNewPwd" placeholder="请输入确认新密码" maxlength="12"/>'+
								'</div>'+
								'<div class="tips-cell">'+
									'<p class="err-tips" id="againNewPwdErr"></p>'+
								'</div>'+
							'</div>'+
						'</div>'+
						'<div class="input-box" style="margin-top:5px;margin-buttom:5px;">' + 
							'<span>密码长度最短为6位，可由数字，字母、特殊符号组成</span>'+
						'</div>';
	    alertWidth = 600;
		alertBtn = [
				{
					html: "确认",
					"class" : "alert-btn",
					click: function() {
						var newPwd = $("#newPwd").val();
						var againNewPwd = $("#againNewPwd").val();
						
						//校验密码格式是否存在问题---------------start
						var newPwdCheckFlag = stringModule.regexpRule("password",newPwd,"");
						var againNewPwdCheckFlag = stringModule.regexpRule("password",againNewPwd,"");
						if(!newPwdCheckFlag.result){
							$("#newPwdErr").html("请输入6位数字或英文字母、特殊字符");
							return;
						}
						if(!againNewPwdCheckFlag.result){
							$("#againNewPwdErr").html("请输入6位数字或英文字母、特殊字符");
							return;
						}else{
							if(newPwd != againNewPwd){
								$("#againNewPwdErr").html("密码不一致");
								return;
							}
						}
						//校验密码格式是否存在问题---------------end
						
						$.ajax({
							headers: {
						        Accept:"application/json",						        
						    },
							type: "POST",
							url: shopIp + "wxdc-mgr-service/user/resetPassword",
							contentType: "application/json",
							data: JSON.stringify({
								id:id,
								password: exports.encryptPwd(newPwd)
							}),
							async: true,
							dataType: "json",
							success: function (res) {
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
					}
				},
			];
			exports.alertBox("alertBox",alertTitle,alertContent,alertBtn,alertWidth);
		},
		//授权
		setAuth: function(id,userName){
			var self = this;
			alertTitle = '<h4 class="center alert-title">给用户【'+userName+'】分配权限</h4>';
			alertContent = '<div class="width-100" style="border:1px #d5d5d5 solid;height:500px;overflow-y: scroll;">'+
								'<div class="zTreeDemoBackground left">'+
									'<ul id="tree" class="ztree"></ul>'+
								'</div>'+
							'</div>';
		    alertWidth = 600;
			alertBtn = [
					{
						html: "确认",
						"class" : "alert-btn",
						click: function() {
							var zTree = $.fn.zTree.getZTreeObj("tree");
							var checkedMenuData = main.formatterMenu(zTree.getCheckedNodes(true));
							$.ajax({
									headers: {
								        Accept:"application/json",						        
								    },
									type: "POST",
									url: shopIp + "wxdc-mgr-service/menu/updateUserAuth",
									contentType: "application/json",
									data: JSON.stringify({
										id:id,
										checkMenuId: checkedMenuData.join(",")
									}),
									async: true,
									dataType: "json",
									success: function (res) {
										if(res.code == "200"){
											alertTitle = '<h4 class="center alert-title">提示</h4>';
									        alertContent = '<div class="alert-content"> ' +
									        					'<p class="center">'+ res.msg +'</p>'+	 									        					
									        				'</div>';
									        alertWidth = 600;
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
										}else{
											alertTitle = '<h4 class="center alert-title">提示</h4>';
									        alertContent = '<div class="alert-content"> ' +
									        					'<p class="center">'+ res.msg +'</p>'+	 									        					
									        				'</div>';
									        alertWidth = 600;
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
				];
			exports.alertBox("alertBox",alertTitle,alertContent,alertBtn,alertWidth);
							
			var zNodes = self.getUserMenuList(id);
				
			self.initZtree(zNodes);
				
		},//查询改用户拥有的菜单
		getUserMenuList:function(id){
			var zNodes = {};
			$.ajax({
				headers: {
			        Accept:"application/json",						        
			    },
				type: "POST",
				url: shopIp + "wxdc-mgr-service/menu/queryUserMenuTreeList",
				contentType: "application/json",
				data: JSON.stringify({
					id:id
				}),
				async: false,
				dataType: "json",
				success: function (res) {
					if(res.code == "200"){
						zNodes = res.data;
					}else{
						alertTitle = '<h4 class="center alert-title">提示</h4>';
				        alertContent = '<div class="alert-content"> ' +
				        					'<p class="center">'+ res.msg +'</p>'+	 									        					
				        				'</div>';
				        alertWidth = 600;
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
			return zNodes;
		},//初始化权限树
		initZtree: function(zNodes){
			var self = this;
			var setting = {
				check: {
					enable: true,
					chkDisabledInherit: false
				},
				data: {
					simpleData: {
						enable: true
					}
				}
			};
			$.fn.zTree.init($("#tree"), setting, zNodes);
		},//置灰菜单
		disabledMenu: function(zNodes){
			for(var i=0;i<zNodes.length;i++){
				zNodes[i].chkDisabled = true;
			}
			return zNodes;
		},//封装菜单id
		formatterMenu: function(data){
			var ztreeData = new Array();
			for(var i=0;i<data.length;i++){
				ztreeData.push(data[i].id);
			}
			return ztreeData;
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
			if(row.groups == "0" && row.userId != userId){
				alertWidth = 600;
				alertTitle = '<h4 class="center alert-title">提示</h4>';
		        alertContent = '<div class="alert-content"> ' +
		        					'<p class="center">管理员禁止修改</p>'+	 									        					
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
		        return ;
			}
			id = row.id;
			addStatus = "Y";
			main.addOrUpdate();
		},
		'click .disable': function(e, value, row, index){
			var content = "";
			if(row.status == "0"){
				content = "是否确认禁用";
			}else{
				content = "是否确认启用";
			}
			alertTitle = '<h4 class="center alert-title">提示</h4>';
            alertContent = '<div class="alert-content"> ' +
            					'<p class="center">'+content+'</p>'+	 
            					
            				'</div>';
            alertWidth = 500;
            alertBtn = [
							{
								html: "确认",
								"class" : "alert-btn",
								click: function() {
									main.startOrDisableUser(row.id,row.status);
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
		'click .delete': function(e, value, row, index){
			alertTitle = '<h4 class="center alert-title">提示</h4>';
            alertContent = '<div class="alert-content"> ' +
            					'<p class="center">是否确认删除，删除后将无法恢复</p>'+	 
            					
            				'</div>';
            alertWidth = 500;
            alertBtn = [
							{
								html: "确认",
								"class" : "alert-btn",
								click: function() {
									main.deleteUserInfo(row.id);
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
		'click .reset': function(e, value, row, index){
			main.resetPassword(row.id);
		},
		'click .auth':function(e, value, row, index){
			main.setAuth(row.id,row.userName);
		}
	}
});

