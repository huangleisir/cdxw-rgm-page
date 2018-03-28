/**
 * 弹窗模块
 * created by LittleYellow/441980627@qq.com
 * popupModule.open({
		templet: '<div style="width:257px;height:170px;background:#FCFCFC;position:fixed;left:50%;top:150px;z-index:1;margin-left:-128.5px;border-radius:12px;"><div id="popup-close" style="width:50px;height:50px;background:#f00;"></div></div>'
	});
 */

window.popModule = (function($) {

	var popup = {}; // 弹窗模块

	var bodyEle, maskEle, contentEle;

	// 阻止浏览器默认事件
	popup.banDefault = function(e) {
		e.preventDefault();
	}

	// 创建元素
	popup.create = function() {
		bodyEle = document.querySelector("body");
		maskEle = document.createElement("div");
		contentEle = document.createElement("div");
		maskEle.classList.add("popup-mask");
		contentEle.classList.add("popup-content");
		contentEle.addEventListener("click", function(event) {
			if(event.target.classList.toString().indexOf("popup-content") >= 0) {
				popup.close();
			}
		});
		bodyEle.appendChild(maskEle);
		bodyEle.appendChild(contentEle);
	}

	// 打开弹窗
	popup.open = function(params) {
		var defaults = {
			closeEleId: "popup-close",
			templet: "<div></div>"
		};
		var options = $.extend(defaults, params);
		popup.create();
		contentEle.innerHTML = options.templet;
		maskEle.classList.add("popup-fadeIn");
		contentEle.classList.add("popup-fadeInUp");
		var closeEle = document.getElementById(options.closeEleId);
		closeEle && closeEle.addEventListener("click", function(event) {
			popup.close();
		});
		document.addEventListener('touchmove', popup.banDefault, false);
	}

	// 关闭弹窗
	popup.close = function() {
		maskEle.classList.remove("popup-fadeIn");
		maskEle.classList.add("popup-fadeOut");
		contentEle.classList.remove("popup-fadeInUp");
		contentEle.classList.add("popup-fadeInDown");
		setTimeout(function() {
			bodyEle.removeChild(maskEle);
			bodyEle.removeChild(contentEle);
		}, 100);
		document.removeEventListener('touchmove', popup.banDefault, false);
	}

	return popup;
})(jQuery);