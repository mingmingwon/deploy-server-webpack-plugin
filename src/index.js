const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const request = require('request');

module.exports = class DeployServerWebpackPlugin {
	constructor(config = {}) {
		this.config = config;
	}

	apply(compiler) {
		compiler.plugin('after-emit', (compilation, callback) => {
			this.validConfig(compilation);
			this.deployHandler(callback);
		});
	}

	validConfig(compilation) {
		const { receiver, token = '' } = this.config;
		let { mapping } = this.config;

		if (!receiver) {
			this.error('Missing param: receiver');
		}
		if (!mapping) {
			this.error('Missing param: mapping');
		}

		const mappingType = Object.prototype.toString.call(mapping);
		if (mappingType === '[object Object]') {
			mapping = [mapping];
		} else if (mappingType === '[object Array]') {
			// do nothing
		} else {
			this.error('Invalid param: mapping');
		}

		const assets = compilation.assets;
		const avalAssets = {};
		mapping.map((item, index) => {
			for (let key in assets) {
				const asset = assets[key];
				const assetPath = asset.existsAt;
				const from = item.from;
				// limit "src" path within compiled files
				if (assetPath.startsWith(from)) {
					if (!avalAssets[from]) {
						avalAssets[from] = [assetPath];
						continue;
					}
					avalAssets[from].push(assetPath);
				}
			}
		});

		const avalKeys = Object.keys(avalAssets);
		if (!avalKeys.length) {
			this.error('No available mapping files');
		}

		this.receiver = receiver;
		this.mapping = mapping;
		this.token = token;
		this.avalKeys = avalKeys;
		this.avalAssets = avalAssets;
	}

	deployHandler(callback) {
		const formData = {};
		this.avalKeys.map((item, index) => {
			this.avalAssets[item].map(from => {
				// compatible with windows
				const dest = (this.mapping[index].to + from.replace(item, '')).replace(/\\/g, '/');
				this.deploy({
					dest,
					token: this.token,
					file: fs.createReadStream(from)
				});
			});
		});

		callback();
	}

	deploy(formData) {
		request.post({
			url: this.receiver,
			formData
		}, (err, { statusCode } = {}, body) => {
			const time = new Date().toLocaleTimeString();
			if (!err && 200 === statusCode) {
				console.log(chalk.green(`[${time}] [success] => ${formData.dest}`));
				return;
			}
			console.log(chalk.yellow(`[${time}] [failed] => ${formData.dest} ${body}`));
		});
	}

	error(err) {
		console.log(`\n${chalk.yellow('[deploy-server-webpack-plugin] ' + err)}`);
		process.exit();
	}
};
