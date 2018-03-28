var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var path = require('path');
var webpack = require('webpack');
var fs = require('fs');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

var srcDir = path.resolve(process.cwd(), 'src');

//获取多页面的每个入口文件，用于配置中的entry
function getEntry() {
	var jsPath = path.resolve(srcDir, 'js');
	var dirs = fs.readdirSync(jsPath);
	var matchs = [],
		files = {};
	dirs.forEach(function(item) {
		matchs = item.match(/(.+)\.js$/);
		console.log(matchs);
		if(matchs) {
			files[matchs[1]] = path.resolve(srcDir, 'js', item); // 只选择src/js文件夹下面的js文件(不含子文件夹里的js文件)
		}
	});
	console.log(JSON.stringify(files));
	return files;
}

module.exports = {
	cache: true,
	//devtool: "source-map",
	entry: getEntry(),
	output: {
		path: path.join(__dirname, "build/js/"), // 打包出来的文件存放目录
		publicPath: "../../build/js/", // 页面引用js资源的目录 
		filename: "[name].js",
		chunkFilename: "[chunkhash].js"
	},
	resolve: {
		alias: {
			//jquery: srcDir + "/js/vendors/jquery.min.js"
		}
	},
	plugins: [
		new CommonsChunkPlugin('common'),
		//      new uglifyJsPlugin({   // 压缩
		//          compress: {
		//              warnings: false
		//          }
		//      })
	]
};