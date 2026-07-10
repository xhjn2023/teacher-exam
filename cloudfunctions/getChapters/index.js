var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = function (event, context) {
  var subjectId = event.subjectId;

  if (!subjectId) {
    return { list: [] };
  }

  return db.collection('chapters')
    .where({ subjectId: subjectId })
    .orderBy('sort', 'asc')
    .get()
    .then(function (res) {
      return { list: res.data };
    });
};
