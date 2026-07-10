// 云函数入口文件
var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = async function (event, context) {
  var res = await db.collection('exam_types').orderBy('sort', 'asc').get();
  return { list: res.data };
};
