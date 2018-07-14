const Koa = require('koa');
const koaBody = require('koa-body');
const Router = require('koa-router');
const fse = require('fs-extra');

const router = new Router();
router.post('/receiver', koaBody({
	multipart: true
}), async (ctx, next) => {
	const { files, body: { dest, token } } = ctx.request;

	// deal with "token" here if needed 

	for (let key in files) {
		const file = files[key];
		try {
			await fse.copy(file.path, dest);
			console.log(new Date().toLocaleString(), 'success', dest);
			ctx.body = '0';
		} catch (err) {
			console.log(new Date().toLocaleString(), 'failed', dest, err);
			ctx.status = 500;
			// don't tell client error detail
			ctx.body = 'Internal Server Error';
		}
	}
});

const app = new Koa();
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
	console.log('server is ready');
});
