// 公共参数

//演练环境:http://10.101.130.36:19091/
//测试环境:http://10.101.130.8:19091/
//生产环境：http://14.215.135.104:9211/
//灰度环境：http://14.215.135.110:9211/
//开发环境:http://10.101.90.14:19091/
var shopIp = "http://10.101.130.8:19091/";
var stringModule = {};
var httpModule = {};
var sessionModule = {};
var dateModule = {};
var timeId_code = "";//发送验证码定时器ID
/**
 * 判断是否为空
 * 有值返回ture，否则返回false
 */
stringModule.CheckEmpty = function(str) {
	if(str != "" && str != null && str != undefined) {
		return true;
	} else if(str == 0 && typeof(str) == "number") {
		return true;
	} else {
		return false;
	}
}
stringModule.amountFen2Yuan = function(amount,_pow_){
	if(isNaN(Number(amount))){//非数
		return "-";
	}else{//数字
		amount = amount/100;
	}
   return amount.toFixed(_pow_);
}

// 获取相应的正则表达式
stringModule.regexpRule = function(type, str , tips) {
//	str = parseInt(str)
	var checkRes = {};
	var checkTips = "ok";
	switch(type) {
		case "number":
		    checkTips = /^\d+$/.test(str) ? checkTips : tips; // /^\d+$/
			checkRes = {result: /^\d+$/.test(str), warn: checkTips};
			break;
		case "must":
		    checkTips = /^\S+$/.test(str) ? checkTips : tips;
			checkRes = {result: /^\S+$/.test(str), warn: checkTips};
			break;
		case "mobile":
		    checkTips = /^1[3|4|5|7|8|9]\d{9}$/.test(str) ? checkTips : tips;
			checkRes = {result: /^1[3|4|5|7|8|9]\d{9}$/.test(str), warn: checkTips};
			break;
		case "email":
		    checkTips = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(str) ? checkTips : tips;
			checkRes = {result: /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(str), warn: checkTips};
			break;
		case "license":
		    var licRes = stringModule.checkLicenceCode(str);
			checkRes = {result: licRes.res, warn: licRes.msg};
			break;
	    case "orgcode":
		    var orgRes = stringModule.checkOrgCode(str);
			checkRes = {result: orgRes.res, warn: orgRes.msg};
			break;
		case "bankcode":
		    checkTips = /^[0-9]{8,32}$/.test(str) ? checkTips : tips;
			checkRes = {result: /^[0-9]{8,32}$/.test(str), warn: checkTips};
			break;
		case "ident":
		    var ideRes = stringModule.identityCodeValid(str);
			checkRes = {result: ideRes.res, warn: ideRes.msg};
			break;		
		case "name":
		    checkTips = /^[\u4e00-\u9fa5]+$/.test(str) ? checkTips : tips;
			checkRes = {result: /^[\u4e00-\u9fa5]+$/.test(str), warn: checkTips};
			break;
		case "float2":
		    checkTips = /([0-9]+\.[0-9]{2})[0-9]*/.test(str) ? checkTips : tips;
			checkRes = {result: /([0-9]+\.[0-9]{2})[0-9]*/.test(str), warn: checkTips};
			break;
		case "userId":
		    checkTips = /^[a-zA-Z]+$/.test(str) ? checkTips : tips;
			checkRes = {result: /^[a-zA-Z]+$/.test(str), warn: checkTips};
			break;
		case "password":
		    checkTips = /^[a-zA-Z0-9`~!@#$^&*%()]{6,12}$/.test(str) ? checkTips : tips;
			checkRes = {result: /^[a-zA-Z0-9`~!@#$^&*%()]{6,12}$/.test(str), warn: checkTips};
			break;
	}
	return checkRes;
}

// 身份证号码验证
stringModule.identityCodeValid = function(code){
  var city={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外 "};
  var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ]; //加权因子
  var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];  //校验位
  var pass= {res:true,msg:""};
  if(code.length == 15){
     code = code.substring(0,6) + "19" + code.substring(6,15);
     var ocode = code.split('');
     var osum = 0;
     for (var i = 0; i < 17; i++){
        osum += ocode[i] * factor[i];
      }
     code = code + (parity[osum % 11]).toString();
  }
  if(!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)){
    pass = {res:false,msg:"请输入正确的身份证号码"}; // 身份证号格式错误
   }else if(!city[code.substr(0,2)]){
      pass = {res:false,msg:"请输入正确的身份证号码"}; // 地址编码错误
     }else{
    //18位身份证需要验证最后一位校验位
    if(code.length == 18){
      code = code.split('');
      var sum = 0;
      for (var i = 0; i < 17; i++){
        sum += code[i] * factor[i];
      }
      if(parity[sum % 11] != code[17]){
        pass = {res:false,msg:"请输入正确的身份证号码"}; // 校验位错误
      }
    }
  }
  return pass;
}


// 时间显示格式化
dateModule.formatDate = function(oDate,sFormation){
    var obj = {
        yyyy:oDate.getFullYear(),
        yy:(""+ oDate.getFullYear()).slice(-2),
        M:oDate.getMonth()+1,
        MM:("0"+ (oDate.getMonth()+1)).slice(-2),
        d:oDate.getDate(),
        dd:("0" + oDate.getDate()).slice(-2),
        H:oDate.getHours(),
        HH:("0" + oDate.getHours()).slice(-2),
        h:oDate.getHours() % 12,
        hh:("0"+oDate.getHours() % 12).slice(-2),
        m:oDate.getMinutes(),
        mm:("0" + oDate.getMinutes()).slice(-2),
        s:oDate.getSeconds(),
        ss:("0" + oDate.getSeconds()).slice(-2),
        w:['日', '一', '二', '三', '四', '五', '六'][oDate.getDay()]
    };
    return sFormation.replace(/([a-z]+)/ig,function($1){return obj[$1]});
}

// 计算未来N年的时间
dateModule.futureDate = function(n){
    var result = new Date;
    result.setFullYear(result.getFullYear () + n);
    return result;
}

//阿拉伯数字转换中文
stringModule.convertToChinese = function(num){
	var N = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
	var str = num.toString();
	var len = num.toString().length;
	var C_Num = [];
    for(var i = 0; i < len; i++){
        C_Num.push(N[str.charAt(i)]);
    }
	return C_Num.join('');
}


/**
 * jQuery的ajax方法
 * 请求方式默认POST
 */
httpModule.ajaxRequest = function(res) {
	if(stringModule.CheckEmpty(res.name)) {
		var reqName = res.name; // 接口名称描述
	} else {
		var reqName = "";
	}
	var options = $.extend({
		type: "POST",
		url: "http://" + location.hostname + "/",
		data: {},
		dataType: "json",
		async: true,
		success: function() {},
		error: function(err) {
			console.log(reqName + " → " + "状态码：" + err.status + " " + "状态描述：" + err.statusText);
		},
		complete: function() {}
	}, res);
	$.ajax({
		type: options.type,
		url: options.url,
		xhrFields: {
			withCredentials: true
		},
		async: options.async,
		data: options.data,
		dataType: options.dataType,
		success: options.success,
		error: options.error,
		complete: options.complete
	});

}

/**
 * 判断用户是否处于登陆状态
 * 不在登录状态下，进行提示并跳转到指定页面，默认是登陆页
 */
sessionModule.isLogin = function(str, tips, url) {
	var reqUrl = "../home/login.html";
	var tipsCon = "请先登录！";
	reqUrl = url == "" || url == null || url == undefined ? reqUrl : url;
	tipsCon = tips == "" || tips == null || url == undefined ? tipsCon : tips;
	if(!stringModule.CheckEmpty(str)) {
		alert(tipsCon);
		window.location.href = reqUrl;
		return {
			msgtext: tipsCon,
			requrl: reqUrl
		};
	}
}

/*	方法：保留两位小数的金额输入
	参数：dom:dom节点---通过id获取
*/
function sumInput(dom) {
	var obj = document.getElementById(dom);
	var reg = /^\d+(\.\d{0,2})?$/g,
		moneyVal = obj.value;
	if(!reg.test(moneyVal)) {
		var _value = moneyVal.substr(0, moneyVal.length - 1);
		obj.value = _value
	}
}

var exports = {
	
	/**
	 * 将字符串转为MD5 Array ,如需字符串，请自行调用.toString
	 * @param {Object} word
	 */
	md5: function(word) {
		return CryptoJS.MD5(word);
	},

	/**
	 * 将array转为BASE64字符串
	 * @param {Object} wordArray
	 */
	base64: function(wordArray) {
		return CryptoJS.enc.Base64.stringify(wordArray);
	},

	/**
	 * 将密码先MD5,后BASE64
	 * @param {Object} pwd
	 */
	encryptPwd: function(pwd) {
		return this.md5(pwd).toString();
//		return this.base64(this.md5(pwd));
	},
	
	/*弹框
	 obj:弹框内容父节点id名
	 alertTitle:弹框标题
	 alertContent:弹框内容
	 alertBtn:弹框按钮数组
	 alertWidth:弹框宽度
	 * */
	alertBox:function(obj,alertTitle,alertContent,alertBtn,alertWidth){
		$.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
			_title: function(title) {
				var $title = this.options.title || '&nbsp;'
				if( ("title_html" in this.options) && this.options.title_html == true )
					title.html($title);
				else title.text($title);
			}
		}));
		obj = "#"+obj;
		$(obj).html(alertContent);
		
		$(obj).removeClass('hide').dialog({
				resizable: false,
				width:alertWidth,
				modal: true,
				title: alertTitle,
				title_html: true,
				buttons: alertBtn
		});
		
	},
	//获取url的参数
	getUrlString:function(name){ 
	    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");     
	    var r = window.location.search.substr(1).match(reg);     
	        if(r!=null){
	            return decodeURI(r[2]);
	        }else{ 
	            return "";
	        }
	},
	//发送验证码弹框
	sendCodeBox:function(sendCodeBox,telNum,callback){
		var self = this,
		rfKey = "",
		obj = sendCodeBox,
		alertTitle = '<h4 class="center alert-title">提示</h4>',
        alertContent = '<div class="alert-content">' +
        					'<p>该笔交易需要进行短信验证</p>'+
        					'<p>'+ telNum.substring(0,3) +'***' + telNum.substring(8) +'</p>'+
        					'<input id="inputCode" type="text" class="sms-input"/>'+
        					'<button id="sendCodeBtn" class="sms-btn">发送验证码</button>'+
        					'<p id="smsErrTips" style="color:#f00;"></p>'
        				'</div>',
        alertWidth = 400,
        alertBtn = [
						{
							html: "确认",
							"class" : "alert-btn",
							click: function() {	
								var $this = $(this);
								self.checkCode(rfKey,$("#inputCode").val(),function(){//校验成功回调
									clearInterval(timeId_code);
									$("#sendCodeBtn").removeClass("unable");
									$("#sendCodeBtn").text("发送验证码");
									callback();
									$this.dialog("close");	
								},function(err){//检验失败回调
									$("#smsErrTips").text(err);
								});
//								$this.dialog("close");									
							}
						}
					];	
		self.alertBox(obj,alertTitle,alertContent,alertBtn,alertWidth);
		$("#inputCode").bind("input",function(){
			var realvalue = this.value.replace(/\D/g, "");
			$(this).val(realvalue);
		});
		$("#inputCode").bind("focus",function(){
			$("#smsErrTips").text("");
		});
		$("#sendCodeBtn").bind("click",function(){
			if($(this).hasClass("unable")){
				return ;
			}

			rfKey = self.getCode(telNum,"sendCodeBtn");
			
		})
	},
	//金额输入格式化
	sumInputFormat:function(obj){
		obj.value = obj.value.replace(/[^\d.]/g,""); //清除"数字"和"."以外的字符
		obj.value = obj.value.replace(/^\./g,""); //验证第一个字符是数字
		obj.value = obj.value.replace(/\.{2,}/g,"."); //只保留第一个, 清除多余的
		obj.value = obj.value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
		obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3'); //只能输入两个小数
	},
	setPassword:function(){
		var self = this;
		alertTitle = '<h4 class="center alert-title">密码修改</h4>';
		alertContent = '<div class="input-box" style="margin-top:5px;">' + 
							'<div class="input-item">' +
								'<div class="input-lab">*原密码：</div>' +
								'<div class="input-cell" style="width:150px;">'+
									'<input type="password" id="jst-formerPwd" placeholder="请输入原密码" maxlength="12"/>'+
								'</div>'+
								'<div class="tips-cell">'+
									'<p class="err-tips" id="jst-formerPwdErr"></p>'+
								'</div>'+
							'</div>'+
						'</div>'+
						'<div class="input-box" style="margin-top:5px;">' + 
							'<div class="input-item">' +
								'<div class="input-lab">*新密码：</div>' +
								'<div class="input-cell" style="width:150px;">'+
									'<input type="password" id="jst-newPwd" placeholder="请输入新密码" maxlength="12"/>'+
								'</div>'+
								'<div class="tips-cell">'+
									'<p class="err-tips" id="jst-newPwdErr"></p>'+
								'</div>'+
							'</div>'+
						'</div>'+
						'<div class="input-box" style="margin-top:5px;">' + 
							'<div class="input-item">' +
								'<div class="input-lab">*确认新密码：</div>' +
								'<div class="input-cell" style="width:150px;">'+
									'<input type="password" id="jst-againNewPwd" placeholder="请输入确认新密码" maxlength="12"/>'+
								'</div>'+
								'<div class="tips-cell">'+
									'<p class="err-tips" id="jst-againNewPwdErr"></p>'+
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
						var jstFormerPwd = $("#jst-formerPwd").val();
						var jstNewPwd = $("#jst-newPwd").val();
						var jstAgainNewPwd = $("#jst-againNewPwd").val();
						var jstFormerPwdCheckFlag = stringModule.regexpRule("password",jstFormerPwd,"");
						var jstNewPwdCheckFlag = stringModule.regexpRule("password",jstNewPwd,"");
						var jstAgainNewPwdCheckFlag = stringModule.regexpRule("password",jstAgainNewPwd,"");
						//验证密码格式是否正确-------------------start
						
						//旧密码格式校验
						if(!jstFormerPwdCheckFlag.result){
							$("#jst-formerPwdErr").html("请输入6位数字或英文字母、特殊字符");
							return;
						}
						//新密码格式校验
						if(jstNewPwdCheckFlag.result){
							if(jstFormerPwd == jstNewPwd){
								$("#jst-newPwdErr").html("新密码与旧密码不能相同");
								return;
							}
						}else{
							$("#jst-newPwdErr").html("请输入6位数字或英文字母、特殊字符");
							return;
						}
						//确认新密码格式校验
						if(jstAgainNewPwdCheckFlag.result){
							if(jstNewPwd != jstAgainNewPwd){
								$("#jst-againNewPwdErr").html("与新密码不一致");
								return;
							}
						}else{
							$("#jst-againNewPwdErr").html("请输入6位数字或英文字母、特殊字符");
							return;
						}
						
						//验证密码格式是否正确-------------------end
						$.ajax({
								headers: {
							        Accept:"application/json",						        
							    },
								type: "POST",
								url: shopIp + "wxdc-mgr-service/wxdc/updatePassword",
								contentType: "application/json",
								data: JSON.stringify({
									userId:sessionStorage.userId,
									password: exports.encryptPwd(jstFormerPwd),
									newPassword: exports.encryptPwd(jstNewPwd)
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
		self.alertBox("alertBox",alertTitle,alertContent,alertBtn,alertWidth);
		
		//绑定失去焦点事件，校验密码格式问题
		$("#jst-formerPwd,#jst-newPwd,#jst-againNewPwd").bind("blur",function(){
			var id = $(this).attr("id");
			var checkFlag = stringModule.regexpRule("password",$(this).val(),"");
			if(id == "jst-formerPwd"){//原始密码校验
				if(checkFlag.result){
					$("#jst-formerPwdErr").html("");
				}else{
					$("#jst-formerPwdErr").html("请输入6位数字或英文字母、特殊字符");
				}
			}else if(id == "jst-newPwd"){//新密码校验
				//1.校验新密码格式是否正确
				//2.校验新密码是否和旧密码相同
				if(checkFlag.result){
					$("#jst-formerPwdErr").html("");
					if($("#jst-formerPwd").val() == $(this).val()){
						$("#jst-newPwdErr").html("新密码与旧密码不能相同");
					}else{
						$("#jst-newPwdErr").html("");
					}
				}else{
					$("#jst-newPwdErr").html("请输入6位数字或英文字母、特殊字符");
				}
			}else if(id == "jst-againNewPwd"){//确认新密码校验
				//1.校验确认密码格式是否正确
				//2.校验确认密码跟新密码是否一致
				if(checkFlag.result){
					$("#jst-againNewPwdErr").html("");
					if($("#jst-newPwd").val() == $(this).val()){
						$("#jst-againNewPwdErr").html("");
					}else{
						$("#jst-againNewPwdErr").html("与新密码不一致");
					}
				}else{
					$("#jst-againNewPwdErr").html("请输入6位数字或英文字母、特殊字符");
				}
			}
		});
	}
};

/**
 * 登陆密码输入校验；
 * firstInputId：第一次密码输入框ID
 * secondInputId：第二次密码输入框ID
 * fun：回调函数
 * */
function loginPwdInput(firstInputId,secondInputId,fun){
	var firstInputEle = $("#"+firstInputId),
		secondInputEle = $("#"+secondInputId),
		regLetter = /^[a-zA-Z]+$/,
		regNumber = /^[0-9]+$/,
		result = {
			msg:"",
			reg:false,
			pwd:"",
			firstResult:{
				msg:"",
				reg:false
			},
			secondResult:{
				msg:"",
				reg:false
			}
		};
	
	/*第一次密码输入*/
	firstInputEle.bind({
		"keyup":function(){
			var realvalue = this.value.replace(/\s+/g, "");
			$(this).val(realvalue);
			
			if(result.secondResult.reg){//确认密码提填写且合法
				
				if(secondInputEle.val().length == $(this).val().length){//两次密码长度一致
					if(secondInputEle.val() == $(this).val()){//与确认密码一致
						result.msg = "两次密码输入一致";
						result.reg = true;
						result.pwd = $(this).val();
					}else{
						result.msg = "两次密码输入不一致";
						result.reg = false;
						result.pwd = "";
					}
				}else if(secondInputEle.val().length <= $(this).val().length){
					result.msg = "两次密码输入不一致";
					result.reg = false;
					result.pwd = "";
				}else{
					result.msg = "";
					result.reg = false;
					result.pwd = "";
				}
				
				
			}else{//确认密码未填写，或者确认密码不合法
				
			}
			
			fun(result);
								
//			console.log($(this).val())
		},
		"blur":function(){
			
			if(regLetter.test($(this).val())){//密码全为字母，不合法
				
				result.firstResult.reg = false;
				result.firstResult.msg = "密码不能全为字母！";
				
			}else if(regNumber.test($(this).val())){//密码全为数字，不合法
				
				result.firstResult.reg = false;
				result.firstResult.msg = "密码不能全为数字！";
				
			}else{

				if($(this).val().match(/\d+/g) != null && $(this).val().match(/[a-zA-Z]+/g) != null){//必须包含字母和数字
					if($(this).val().length >= 6 && $(this).val().length <= 20){//密码格式和长度合法
						result.firstResult.reg = true;
						result.firstResult.msg = "";
					}else{//密码格式合法，但长度不合法
						result.firstResult.reg = false;
						result.firstResult.msg = "密码长度不正确！";
					}
					
				}else{//密码格式不合法
					
					result.firstResult.reg = false;
					result.firstResult.msg = "密码必须包含数字和字母！";
					
				}
				
			}
			fun(result);
			
		},
		"focus":function(){
			
		}
	});
	/*第二次密码输入*/
	secondInputEle.bind({
		"keyup":function(){
			var realvalue = this.value.replace(/\s+/g, "");
			$(this).val(realvalue);								
			
			if(result.firstResult.reg){//确认密码提填写且合法
				
				if(firstInputEle.val().length == $(this).val().length){//两次密码长度一致
					if(firstInputEle.val() == $(this).val()){//与确认密码一致
						result.msg = "两次密码输入一致";
						result.reg = true;
						result.pwd = $(this).val();
					}else{
						result.msg = "两次密码输入不一致";
						result.reg = false;
						result.pwd = "";
					}
				}else if(firstInputEle.val().length <= $(this).val().length){
					result.msg = "两次密码输入不一致";
					result.reg = false;
					result.pwd = "";
				}else{
					result.msg = "";
					result.reg = false;
					result.pwd = "";
				}
				
				
			}else{//确认密码未填写，或者确认密码不合法
				
			}
			fun(result);
		},
		"blur":function(){
			
			if(regLetter.test($(this).val())){//密码全为字母，不合法
				
				result.secondResult.reg = false;
				result.secondResult.msg = "密码不能全为字母！";
				
			}else if(regNumber.test($(this).val())){//密码全为数字，不合法
				
				result.secondResult.reg = false;
				result.secondResult.msg = "密码不能全为数字！";
				
			}else{

				if($(this).val().match(/\d+/g) != null && $(this).val().match(/[a-zA-Z]+/g) != null){//必须包含字母和数字
					if($(this).val().length >= 6 && $(this).val().length <= 20){//密码格式和长度合法
						result.secondResult.reg = true;
						result.secondResult.msg = ""
					}else{//密码格式合法，但长度不合法
						result.secondResult.reg = false;
						result.secondResult.msg = "密码长度不正确！"
					}
					
				}else{//密码格式不合法					
					result.secondResult.reg = false;
					result.secondResult.msg = "密码必须包含数字和字母！"
					
				}
				
			}
			fun(result);
			
		},
		"focus":function(){
			
		}
	});
}

/**
 * 功能：数字和字母组合输入；
 * 参数：eleId:输入对象id;   callback:回调函数
 * **/
//
exports.inputPassword = function(eleId,callback){
	var regLetter = /^[a-zA-Z]+$/,
		regNumber = /^[0-9]+$/,
		result = {
			msg:"",
			reg:false,
			pwd:"",
		};
	eleId = "#"+eleId;
	
	$(eleId).on({
		'keyup':function(){
			var realvalue = this.value.replace(/\s+/g, "");
			$(this).val(realvalue);
			
			callback(result);
		},
		'blur':function(){
			if(regLetter.test($(this).val())){//密码全为字母，不合法
				
				result.reg = false;
				result.msg = "密码不能全为字母！";
				
			}else if(regNumber.test($(this).val())){//密码全为数字，不合法
				
				result.reg = false;
				result.msg = "密码不能全为数字！";
				
			}else{

				if($(this).val().match(/\d+/g) != null && $(this).val().match(/[a-zA-Z]+/g) != null){//必须包含字母和数字
					if($(this).val().length >= 6 && $(this).val().length <= 20){//密码格式和长度合法
						result.reg = true;
						result.msg = ""
					}else{//密码格式合法，但长度不合法
						result.reg = false;
						result.msg = "密码长度不正确！"
					}
					
				}else{//密码格式不合法					
					result.reg = false;
					result.msg = "密码必须包含数字和字母！"
					
				}
				
			}
			
			callback(result);
		},
		'focus':function(){
			
			
			callback(result);
		}
	});
		
}

