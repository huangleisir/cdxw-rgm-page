/**
 * loading模块
 */

window.loadingModule = function() {
	var pop;
	return {
		create: function(cb) {
			cb = cb || function() {};
			if(pop) {
				document.body.removeChild(pop);
				return;
			}
			pop = document.createElement("div");
			pop.classList.add('loading-pop');
			pop.innerHTML = '<div class="loading-message"><span class="loading-spinner"></span></div>';
			document.body.appendChild(pop);
			cb();
		},
		remove: function(cb) {
			cb = cb || function() {};
			if(!pop) {
				return;
			}
			setTimeout(function() {
				document.body.removeChild(pop);
				pop = null;
				cb();
			}, 1000);
		}
	};
}