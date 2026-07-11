var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

/**
 * 题目报错反馈
 * event: { questionId, type, content, subjectId }
 *   type: 报错类型 wrong_answer(答案错误) / typo(题目有错别字) / analysis(解析有误) / other(其他)
 *   content: 详细描述
 */
exports.main = function (event, context) {
  var wxContext = cloud.getWXContext();
  var userId = wxContext.OPENID;

  var questionId = event.questionId;
  var content = event.content;
  // 参数校验：questionId 和 content 必填
  if (!questionId || !content || !String(content).trim()) {
    return { code: -1, msg: '参数缺失' };
  }

  var report = {
    userId: userId,
    questionId: questionId,
    subjectId: event.subjectId || '',
    type: event.type || 'other',
    content: content,
    status: 'pending',
    createTime: new Date()
  };

  return db.collection('question_reports').add({ data: report })
    .then(function () {
      return { code: 0, msg: '感谢反馈' };
    })
    .catch(function () {
      return { code: -1, msg: '提交失败' };
    });
};
