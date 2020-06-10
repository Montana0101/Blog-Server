/**
 * @description 连接redis的方法
 * @author montana
 */

const redis = require('redis')
const { REDIS_CONF } = require('../conf/db')

// 创建客户端
const redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)
redisClient.on('error', (err) => {
  console.error('redis err', err)
})

/**
 * redis set
 * @param {string} key 键
 * @param {string} val 值
 * @param {number} timeout 过期时间,单位秒
 */
function set(key, val, timeout = 60 * 60) {
  if (typeof val == 'object') {
    val = JSON.stringify(val)
  }
  redisClient.set(key, val)
  redisClient.expire(key, timeout)
}

/**
 * redis get
 * @param {string} key 键
 */

function get(key) {
  const promise = new Promise((resolve, reject) => {
    redisClient.get(key, (err, val) => {
      if (err) {
        reject(err)
      }
      if (val == null) {
        resolve(null)
      }
      try {
        JSON.parse(val)
        resolve(val)
      } catch (err) {
        resolve(val)
      }
    })
  })
  return promise
}