var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

/**
 * 切换题目收藏状态
 * event: { questionId, isFavorited, subjectId }
 */
exports.main = async function (event, context) {
  var wxContext = cloud.getWXContext();
  var userId = wxContext.OPENID;
  var questionId = event.questionId;
  var isFavorited = event.isFavorited; // true=收藏, false=取消
  var subjectId = event.subjectId || '';

  if (!userId) return { code: -1, msg: '未登录' };
  if (!questionId) return { code: -1, msg: '缺少题目ID' };

  try {
    if (isFavorited) {
      // 收藏：先查是否已存在，避免重复
      var exist = await db.collection('user_favorites')
        .where({ userId: userId, questionId: questionId })
        .get();
      if (exist.data.length === 0) {
        await db.collection('user_favorites').add({
          data: {
            userId: userId,
            questionId: questionId,
            subjectId: subjectId,
            createTime: new Date()
          }
        });
      }
    } else {
      // 取消收藏
      var records = await db.collection('user_favorites')
        .where({ userId: userId, questionId: questionId })
        .get();
      for (var i = 0; i < records.data.length; i++) {
        await db.collection('user_favorites').doc(records.data[i]._id).remove();
      }
    }
    return { code: 0, isFavorited: isFavorited };
  } catch (err) {
    console.error('toggleFavorite error:', err);
    return { code: -1, msg: '操作失败' };
  }
};
