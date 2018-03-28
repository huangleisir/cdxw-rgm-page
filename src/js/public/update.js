/**
 * APP启动检查更新
 * created by Max/jingming.li@jieshunpay.cn
 */

module.exports = (function($) {
	$.plusReady(function() {

		postData("app/rest/version/queryLatestVersionInfo", {
			appId: "JSTAPP",
			version: plus.runtime.version,
			osType: $.os.ios ? 2 : $.os.android ? 1 : 3, //1-安卓，2-ios,3其它
		}, function(res) {
			if("00" == res.resType) {
				//处理更新
				var result = res.data,
					appLatestVersion = result.appLatestVersion, //app最新版本号
					isMandatory = result.isMandatory, //是否强制更新（0不强制，1强制）
					appChannel = result.appChannel, //1安卓  2 IOS
					downLoadUrl = result.downLoadUrl, //下载地址
					versionDesc = result.versionDesc; //版本描述，更新说明
				var buttons = ["取消", "去更新"];
				if(1 == isMandatory) {
					buttons = ["去更新"];
				}
				plus.nativeUI.confirm(versionDesc || "发现新的版本", function(e) {
					if(e.index == 1) {
						plus.runtime.openURL(downLoadUrl);
					} else {
						if(1 == isMandatory && buttons.length == 1) {
							//强制更新
							plus.runtime.openURL(downLoadUrl);
							plus.nativeUI.showWaiting("", {
								back: "none"
							});
						}
					}
				}, "更新提示", buttons);
			}
		}, null, {
			errorToast: false,
			showWait: false
		});
	});
})(mui);