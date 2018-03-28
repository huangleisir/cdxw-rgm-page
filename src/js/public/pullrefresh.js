/**
 * 上拉下拉刷新
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = (function($) {
	var main = {
		//初始化执行
		init: function(subPageUrl, subPageId) {
			var self = this,
				fontSize = parseInt(document.getElementsByTagName("html")[0].style.fontSize);;
			$.init({
				gestureConfig: {
					doubletap: true
				},
				subpages: [{
					url: subPageUrl,
					id: subPageId,
					styles: {
						top: (window.needHeaderHidden ? "0" : (fontSize * 2.2 + 1)) + "px",
						bottom: '0px'
					}
				}]
			});
			self.bindEvent();

		},

		//事件绑定
		bindEvent: function() {
			var contentWebview = null;
			document.querySelector('header').addEventListener('doubletap', function() {
				if(contentWebview == null) {
					contentWebview = plus.webview.currentWebview().children()[0];
				}
				contentWebview.evalJS("mui('#pullrefresh').pullRefresh().scrollTo(0,0,100)");
			});
		}
	};

	return {
		init: function(subPageUrl, subPageId) {

			if(stringUtil.isEmpty(subPageUrl)) {
				return;
			}

			$.initComplete(function() {
				main.init(subPageUrl, subPageId || subPageUrl);
			});
		}
	};

})(mui);
//end