/**
 * 选择器数据初始化
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = {
	/**
	 * 信用卡有效期列表
	 */
	creditExpiryDate: function() {
		var dateArray = new Array();

		var endYear = 2030; //结束年限
		
// 顺序输出是 年/月		
//		for(var i = 2010; i <= endYear; i++) {
//			var yearObj = {
//				value: i.toString().slice(-2),
//				text: i + "年"
//			};
//
//			var monthArray = new Array();
//			for(var j = 1; j <= 12; j++) {
//				monthArray.push({
//					value: j < 10 ? "0" + j : j,
//					text: j + "月"
//				});
//			}
//			yearObj.children = monthArray;
//
//			dateArray.push(yearObj);
//		}
		
		// 顺序输出是 月/年
		for(var j = 1; j <= 12; j++) {
			
			var yearArray = new Array();
			for(var i = 2010; i <= endYear; i++) {
				yearArray.push({
					value: i.toString().slice(-2),
					text: i + "年"
				});
			}

			var monthObj = {
				value: j < 10 ? "0" + j : j,
				text: j + "月"
			}
			monthObj.children = yearArray;
			dateArray.push(monthObj);
		}

		return dateArray;
	}

}