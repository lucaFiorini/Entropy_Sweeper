const { stat } = require("fs");
const path = require("path");
module.exports = {
	mode: "development",
	entry: path.join(__dirname, "src", "script"),
	output: {
		path: path.join(__dirname, "dist"),
		publicPath: "/dist/",
		filename: "bundle.js",
		chunkFilename: "[name].js"
	},
	module: {
		rules: [
			{
				test: /.jsx?$/,
				include: [path.resolve(__dirname, "src")],
				exclude: [path.resolve(__dirname, "node_modules")],
				loader: "babel-loader",
				options: {
					presets: [
						[
							"@babel/env",
							{
								targets: {
									browsers: "last 2 chrome versions"
								}
							}
						]
					]
				}
			}
		]
	},
	resolve: {
		extensions: [".json", ".js", ".jsx"]
	},
	devtool: "source-map",
	devServer: {
		host: "localhost",
		port: process.env.port || 8080,
		static: {
			directory: __dirname, // Serve index.html from project root
		},
	}
};
