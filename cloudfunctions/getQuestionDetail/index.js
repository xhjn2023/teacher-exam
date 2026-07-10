var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = function (event, context) {
  var questionId = event.questionId;

  if (!questionId) {
    return { question: null };
  }

  return db.collection('questions')
    .doc(questionId)
    .get()
    .then(function (res) {
      return { question: res.data };
    });
};
