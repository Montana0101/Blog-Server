const path = require('path')
const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-generic-session')
const redisStore = require('koa-redis')
const koaStatic = require('koa-static')
const Spider = require('./spider/covid')

const blog = require('./routes/blog')
const user = require('./routes/user')
const spider = require('./routes/spider')

const { REDIS_CONF } = require('./conf/db')

console.log('当前环境为', process.env.NODE_ENV)
// 实时获取数据
setInterval(() => {
  new Spider()
}, 1000 * 30)

// error handler
onerror(app)

// 指定目录
app.use(koaStatic('../public'))

// middlewares
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text'],
  })
)

app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(
  views(__dirname + '/views', {
    extension: 'ejs',
  })
)

// session配置
app.keys = ['MONTANA_7#132']
app.use(
  session({
    key: 'blog.sid', //cookie前缀 默认koa.sid
    prefix: 'blog:sess', //redis key的前缀 默认koa:sess
    cookie: {
      path: '/',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, //ms
    },
    ttl: 24 * 60 * 60 * 1000, //redis过期，可以不设置
    store: redisStore({
      all: `${REDIS_CONF.host}:${REDIS_CONF.port}`,
    }),
  })
)

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(blog.routes(), blog.allowedMethods())
app.use(user.routes(), user.allowedMethods())
app.use(spider.routes(), spider.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

module.exports = app
