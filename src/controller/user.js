/**
 * @description user controller
 * @author montana
 */

const { getUserInfo } = require('../services/user')
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const { registerUserNameNotExistInfo } = require('../model/ErrorInfo')
const { User, Blog } = require('../db/model')

/**
 * 用户名是否已存在
 * @param {string} userName
 */

async function isExist(userName) {
  const userInfo = await getUserInfo(userName)
  if (userInfo) {
    // 已存在
    return new SuccessModel(userInfo)
  } else {
    return new ErrorModel(registerUserNameNotExistInfo)
  }
  // 统一返回格式
}

const userRegister = async (userName, password, realName = {}) => {
  const result = await User.create({
    userName,
    password,
    realName,
  })
  return result
    ? new SuccessModel(result.dataValues)
    : new ErrorModel('注册失败')
}

const userLogin = async (userName, password) => {
  const result = await User.findOne({
    where: {
      userName: userName,
      password: password,
    },
  })

  return result
    ? new SuccessModel(result.dataValues)
    : new ErrorModel('账号密码不匹配')
}

// 管理员详情列表
const getAdminInfo = async (author) => {
  const result = await User.findAndCountAll({
    where: {
      userName: author,
    },
    include: [
      {
        model: Blog,
      },
    ],
  })
  return new SuccessModel({
    count: result.count,
    data: result.rows.map((item) => item.dataValues),
  })
}

module.exports = { isExist, userRegister, userLogin, getAdminInfo }