jQuery(function($){
	var onLine = sessionModule.isLogin(sessionStorage.userId);
	var main = {
			init:function(){
				var self = this;
				if(stringModule.CheckEmpty(onLine)) { // 判断用户是否处于登陆状态
					return false;
				}
				self.getMenuPemission(sessionStorage.id);
				//self.initMenu();
				self.bindEvent();
				self.createMenu();
			},//获取用户菜单
			getMenuPemission:function(id){
				$.ajax({
					headers: {
				        Accept:"application/json",						        
				    },
					type: "POST",
					url: shopIp + "wxdc-mgr-service/menu/queryUserMenuList",
					contentType: "application/json",
					data: JSON.stringify({
						id:id
					}),
					async: false,
					dataType: "json",
					success: function (res) {
						if(res.code == "200"){
							var orderManageArry = [],//订单管理
								foodManageArry = [],//菜品管理
								sysManageArry = [];//系统管理
								
							orderManageArry = main.getMenu(res.data,10,100);
							foodManageArry = main.getMenu(res.data,100,200);
							sysManageArry = main.getMenu(res.data,200,300);
							
							var menuObj = {};
							menuObj.orderManageArry = orderManageArry;
							menuObj.foodManageArry = foodManageArry;
							menuObj.sysManageArry = sysManageArry;
							
							sessionStorage.setItem("menuObj",JSON.stringify(menuObj))
							sessionStorage.setItem("menuData",JSON.stringify(res.data));
						}else{
							alert(res.msg);
						}
					},
					error: function () {
						alert("服务未开启");
					}
				});
			},//筛选菜单分组
			getMenu:function(data,startId,endId){
				var menuArry = [];
				if(data != "" && data != null && data != undefined){
					if(data.length > 0){					
						for(var i=0;i<data.length;i++){
							if((data[i].menuId == startId ||data[i].parentId == startId ||(data[i].parentId > startId && data[i].parentId < endId)) && data[i].position == "1" ){
								menuArry.push(data[i])
							}
						}
							
					}
				}
				return menuArry;
			},
			createMenu:function(){
				var data = sessionStorage.getItem("menuObj");
				var firstMenuHtml = '<li class="hsub nav-li {{firstNav}}"><a href="{{firstUrl}}" class="{{firstClass}}"><i class="icon {{fistMenuIcon}}"></i><span class="menu-text"> {{firstMenuName}} </span></a><ul class="submenu" id="shMenu">{{secondMenu}}</li></ul>';
				var seconMenuHtml = '<li class="nav-li second-nav {{seccondMenuClass}}" data="{{seccondMenuClass}}"><a href="{{secondMenuUrl}}" class="second-menu">{{secondMenuName}}</a></li>';
				var menuHtml = "",shopManageHtml = "",indexFlag = true,indexUrl = "",indexClass = "";
				if(data != "" && data != null && data != undefined){
					data = JSON.parse(data);
					if(data.orderManageArry.length > 0){//订单管理
						var shopfirstHtml = "",shopsecondHtml = "";
						for(var i=0;i<data.orderManageArry.length;i++){
							
							if(data.orderManageArry[i].parentId == 0){
								shopfirstHtml = firstMenuHtml.replace("{{firstMenuName}}",data.orderManageArry[i].menuName)
															.replace("{{fistMenuIcon}}","sh-icon")
															.replace("{{firstUrl}}","javascript:void(0)")
															.replace("{{firstClass}}","dropdown-toggle")
															.replace("{{firstNav}}","");
								
							}else{
								if(indexFlag && data.orderManageArry[i].url != null){
									indexFlag = false;
									indexUrl = data.orderManageArry[i].url;
									indexClass = "order-li";
								}
								shopsecondHtml += seconMenuHtml.replace("{{secondMenuName}}",data.orderManageArry[i].menuName)
															.replace("{{secondMenuUrl}}",data.orderManageArry[i].url)
															.replace(/{{seccondMenuClass}}/g,"order-li");

							}
						}
						menuHtml += shopfirstHtml.replace("{{secondMenu}}",shopsecondHtml);
						
					}
					if(data.foodManageArry.length > 0){//菜品管理
						var shopfirstHtml = "",shopsecondHtml = "";
						for(var i=0;i<data.foodManageArry.length;i++){
							
							if(data.foodManageArry[i].parentId == 0){
								shopfirstHtml = firstMenuHtml.replace("{{firstMenuName}}",data.foodManageArry[i].menuName)
															.replace("{{fistMenuIcon}}","sh-icon")
															.replace("{{firstUrl}}","javascript:void(0)")
															.replace("{{firstClass}}","dropdown-toggle")
															.replace("{{firstNav}}","");
								
							}else{
								if(indexFlag && data.foodManageArry[i].url != null){
									indexFlag = false;
									indexUrl = data.foodManageArry[i].url;
									indexClass = "food-li";
								}
								shopsecondHtml += seconMenuHtml.replace("{{secondMenuName}}",data.foodManageArry[i].menuName)
															.replace("{{secondMenuUrl}}",data.foodManageArry[i].url)
															.replace(/{{seccondMenuClass}}/g,"food-li");

							}
						}
						menuHtml += shopfirstHtml.replace("{{secondMenu}}",shopsecondHtml);
						
					}
					if(data.sysManageArry.length > 0){//系统管理
						var shopfirstHtml = "",shopsecondHtml = "";
						for(var i=0;i<data.sysManageArry.length;i++){
							
							if(data.sysManageArry[i].parentId == 0){
								shopfirstHtml = firstMenuHtml.replace("{{firstMenuName}}",data.sysManageArry[i].menuName)
															.replace("{{fistMenuIcon}}","sh-icon")
															.replace("{{firstUrl}}","javascript:void(0)")
															.replace("{{firstClass}}","dropdown-toggle")
															.replace("{{firstNav}}","");
								
							}else{
								if(indexFlag && data.sysManageArry[i].url != null){
									indexFlag = false;
									indexUrl = data.sysManageArry[i].url;
									indexClass = "sys-li";
								}
								shopsecondHtml += seconMenuHtml.replace("{{secondMenuName}}",data.sysManageArry[i].menuName)
															.replace("{{secondMenuUrl}}",data.sysManageArry[i].url)
															.replace(/{{seccondMenuClass}}/g,"sys-li");

							}
						}
						menuHtml += shopfirstHtml.replace("{{secondMenu}}",shopsecondHtml);
						
					}
				
					$("#menu").html(menuHtml);
					
					var activeData = sessionStorage.getItem("activeMenu");
					activeData = JSON.parse(activeData);
					if(activeData != "" && activeData != undefined && activeData != null){
						$("."+ activeData.dataClass).eq(activeData.index).addClass("menu-on");
						$("."+ activeData.dataClass).eq(activeData.index).parents(".hsub").addClass("active");
					}else{
						activeData = {
							dataClass:indexClass,
							index:0
						}
						$("."+ activeData.dataClass).eq(activeData.index).addClass("menu-on");
						$("."+ activeData.dataClass).eq(activeData.index).parents(".hsub").addClass("active");
						sessionStorage.setItem("activeMenu",JSON.stringify(activeData));
						window.location.href = indexUrl;
					}
					
				}
			},
			bindEvent:function(){
				//用户名
				$(".top-username").text("您好，" + sessionStorage.userName);
					
				//退出事件
				$(".logout").bind("click",function(){
					sessionStorage.clear();
					window.location.href = "../home/login.html";
				});
				
				/*设置nav点击事件*/
				/*$(".set-nav-box").on("click",".set-nav-item",function(){
					var href = $(this).attr("data-href");
					var index = $(this).index();
					if(index == 4){
						main.getQuestionState()
					}else{
						window.location.href = href;
					}
					
				});*/
				/*设置左边nav点击事件*/
				/*$(".left-nav-cell").on("click",".left-nav-item",function(){
					var href = $(this).attr("data-href");
					if(sessionStorage.getItem("setState") == "1" && href == "security_set.html"){
						alert("您已设置了安全问题，不可再设置");
					}else if(sessionStorage.getItem("setState") == "0" && href == "security_mod_affirm.html"){
						alert("请现设置安全问题");
					}else{
						window.location.href = href;
					}
					
				});*/
				
				
				$("#menu").on("click",".second-nav",function(){
					var dataClass = $(this).attr("data");
					var index = $(this).index();
					var data = {
						dataClass:dataClass,
						index:index
					}
					sessionStorage.setItem("activeMenu",JSON.stringify(data));
				});
				
     			/*$("#menu").on("click",".hsub",function(){
					if($(this).hasClass("record-nav")){
						var data = {
							dataClass:"record-nav",
							index:0
						}
					sessionStorage.setItem("activeMenu",JSON.stringify(data));
					}
					
				});*/
				
			}
		}
		main.init();
});
