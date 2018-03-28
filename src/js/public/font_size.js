(function() {
	var docEl = document.documentElement,
		clientWidth = docEl.clientWidth;
	if(!clientWidth) return;
	var fontsize = clientWidth / 14.4;
	docEl.style.fontSize = this.fontSize = fontsize + 'px';
	docEl.setAttribute('fontsize', fontsize);
})();