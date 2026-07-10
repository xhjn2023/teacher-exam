var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = async function (event) {
  var examTypeId = event.examTypeId;
  var res = await db.collection('subjects')
    .where({ examTypeId: examTypeId })
    .orderBy('sort', 'asc')
    .get();
  return { list: res.data };
};
