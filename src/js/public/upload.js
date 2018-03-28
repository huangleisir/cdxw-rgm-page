/**
 * 上传文件
 * created by Max/jingming.li@jieshunpay.cn
 */
require("./mui_expansion");
module.exports = (function($) {
	var returnResult = {},
		log = function(text) {
			console.log(text);
		},

		/**
		 * 上传单个文件
		 * @param {Object} options
		 */
		uploadSingleFile = function(_options) {

			var task = plus.uploader.createUpload(constant.qiniuUploadServer, {
					method: "POST"
				},
				function(t, status) {
					var resultText = "单个文件上传结果,filePath:{{filePath}},status:{{status}},reponse:{{responseText}}".replace("{{status}}", status).replace("{{responseText}}", t.responseText).replace("{{filePath}}", _options.filePath);
					log(resultText);
					if(status == 200) {
						//上传完成
						_options.successCallback && _options.successCallback(t.responseText);
					} else {
						_options.failCallback && _options.failCallback(t.responseText);
					}
				}
			);
			task.addData("token", _options.token);
			task.addFile(_options.filePath, {
				key: "file"
			});

			if(_options.onStateChanged) {
				// 监听上传任务状态
				function onStateChanged(upload, status) {
					log("单个文件上传进度--uuid:" + _options.uuid + "--status:" + status + "--uploadedSize:" + upload.uploadedSize + "--totalSize:" + upload.totalSize);
					upload.uuid = _options.uuid;
					_options.onStateChanged(upload);
				}
				task.addEventListener("statechanged", onStateChanged, false);
			}

			task.start();
		};

	//API----------------
	/**
	 * 上传多个文件
	 * @param {Object} options:{
	 * 	token : "xxxxxx",//七牛凭证
	 *  files : ["filePath1","filePath2"...],//文件列表
	 *  successCallback : function(){},//上传成功回调,回调参数:array["七牛返回的上传成功hash值"...]
	 *  failCallback : function(){},//上传失败回调,回调参数:错误说明
	 *  onStateChanged : function(){}//上传进度回调，回调参数:{uploadedSize: alluploadedSize,//总文件大小
	 *														  totalSize: alltotalSize,//已上传大小
	 *														  percent: percent//上传进度浮点型
	 *                                                       }
	 * }
	 */
	returnResult.uploadMultipleFiles = function(options) {
		var _options = $.extend({
			fileName: "", //文件名称
			token: "98kTbjrDlgp5fkOGxRUaS5TyhkNMWT_VWa4CEMDH:_soJ2NOBMm4M2yEx1aOF3wXecTQ=:eyJzY29wZSI6ImltZ2NlbnRlciIsImRlYWRsaW5lIjoxNDk4MjAyMTQ1fQ==" //测试TOKEN
		}, options);

		if(stringUtil.isEmpty(_options.token)) {
			var text = "上传失败,TOKEN为空!";
			log(text);
			_options.failCallback && _options.failCallback(text);
			return;
		}

		if(stringUtil.isEmpty(_options.files) || typeof(_options.files) != "object") {
			var text = "上传失败,文件为空或者文件列表为非数组!";
			log(text);
			_options.failCallback && _options.failCallback(text);
			return;
		}

		var filesNum = _options.files.length, //总需上传文件数
			uploadSuccessNum = 0, //已上传成功数
			uploadFailNum = 0, //失败数
			resultArray = new Array(),
			processObj = {}, //存储各个文件大小，上传进度等
			/**
			 * 每次上传成功或失败后都回调
			 */
			callback = function() {

				log("所有文件上传结果:-成功:" + uploadSuccessNum + ",失败:" + uploadFailNum);
				if(uploadFailNum + uploadSuccessNum == filesNum) {
					//上传成功+上传失败总数=总需上传数,则回调
					log("所有文件上传结果回调:" + resultArray);
					_options.successCallback && _options.successCallback(resultArray);
				}
			},
			/**
			 * 单个文件上传成功回 调
			 * @param {Object} res
			 */
			success = function(res) {
				uploadSuccessNum++;
				try {
					var resJson = JSON.parse(res);
					var hash = resJson.hash;
					if(!stringUtil.isEmpty(hash)) {
						resultArray.push(hash);
					}
				} catch(e) {
					//TODO handle the exception
				}
				callback();
			},
			/**
			 * 单个文件上传失败回 调
			 */
			fail = function() {
				uploadFailNum++;
				callback();
			},
			/**
			 * 上传文件状态监听
			 * @param {Object} uploadObj
			 */
			onStateChanged = function(uploadObj) {

				var uploadedSize = uploadObj.uploadedSize,
					totalSize = uploadObj.totalSize;
				processObj[uploadObj.uuid] = uploadObj;

				var allProcess = 0, //统计已经开始上传的文件数量
					alluploadedPercent = 0, //所有文件已经上传百分
					alluploadedSize = 0,
					alltotalSize = 0; //所有文件总大小

				for(var pkey in processObj) {
					var singlePercent = processObj[pkey].uploadedSize / processObj[pkey].totalSize;
					if(isNaN(singlePercent)) {
						singlePercent = 0;
					}
					alluploadedPercent += singlePercent;
					alluploadedSize += processObj[pkey].uploadedSize;
					alltotalSize += processObj[pkey].totalSize;
				}
				var percent = alluploadedPercent / filesNum;

				if(isNaN(percent)) {
					percent = 0;
				}
				//所有文件都已经开始上传了,进度开始回调
				log("总上传进度:alluploadedSize:" + alluploadedSize + "---alltotalSize:" + alltotalSize + "---percent:" + percent);
				_options.onStateChanged && _options.onStateChanged({
					uploadedSize: alluploadedSize,
					totalSize: alltotalSize,
					percent: percent
				});
			};

		for(var key in _options.files) {
			uploadSingleFile({
				uuid: stringUtil.randomString(8),
				token: _options.token,
				filePath: _options.files[key],
				successCallback: success,
				failCallback: fail,
				onStateChanged: onStateChanged
			});
		}
	};

	return returnResult;
})(mui);