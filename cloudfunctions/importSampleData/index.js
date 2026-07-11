/**
 * 导入示例题库数据（幂等，重复执行不会重复插入）
 * 部署后调用一次即可
 */
var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = async function () {
  var result = { inserted: {}, errors: [] };

  // ==================== 考试类型 ====================
  var examTypes = [
    { _id: 'exam_01', name: '教师资格证', icon: '', sort: 1, subjects: ['sub_01', 'sub_02'], desc: '幼儿园/小学/中学教师资格', createTime: new Date() },
    { _id: 'exam_02', name: '教师招聘', icon: '', sort: 2, subjects: ['sub_03', 'sub_04'], desc: '各地区教师编制招聘考试', createTime: new Date() },
    { _id: 'exam_03', name: '特岗教师', icon: '', sort: 3, subjects: ['sub_05'], desc: '农村义务教育阶段特设岗位', createTime: new Date() }
  ];
  result.inserted.exam_types = await upsertAll('exam_types', examTypes);

  // ==================== 科目 ====================
  var subjects = [
    { _id: 'sub_01', examTypeId: 'exam_01', name: '综合素质', icon: '', sort: 1, questionCount: 120, createTime: new Date() },
    { _id: 'sub_02', examTypeId: 'exam_01', name: '教育知识与能力', icon: '', sort: 2, questionCount: 150, createTime: new Date() },
    { _id: 'sub_03', examTypeId: 'exam_02', name: '教育综合知识', icon: '', sort: 1, questionCount: 200, createTime: new Date() },
    { _id: 'sub_04', examTypeId: 'exam_02', name: '学科专业知识', icon: '', sort: 2, questionCount: 180, createTime: new Date() },
    { _id: 'sub_05', examTypeId: 'exam_03', name: '教育理论基础', icon: '', sort: 1, questionCount: 160, createTime: new Date() }
  ];
  result.inserted.subjects = await upsertAll('subjects', subjects);

  // ==================== 章节 ====================
  var chapters = [
    { _id: 'ch_01', subjectId: 'sub_01', name: '职业理念', sort: 1, questionCount: 25, createTime: new Date() },
    { _id: 'ch_02', subjectId: 'sub_01', name: '教育法律法规', sort: 2, questionCount: 30, createTime: new Date() },
    { _id: 'ch_03', subjectId: 'sub_01', name: '教师职业道德规范', sort: 3, questionCount: 20, createTime: new Date() },
    { _id: 'ch_04', subjectId: 'sub_01', name: '文化素养', sort: 4, questionCount: 25, createTime: new Date() },
    { _id: 'ch_05', subjectId: 'sub_01', name: '基本能力', sort: 5, questionCount: 20, createTime: new Date() },
    { _id: 'ch_06', subjectId: 'sub_02', name: '教育学原理', sort: 1, questionCount: 35, createTime: new Date() },
    { _id: 'ch_07', subjectId: 'sub_02', name: '心理学基础', sort: 2, questionCount: 30, createTime: new Date() },
    { _id: 'ch_08', subjectId: 'sub_02', name: '教育心理学', sort: 3, questionCount: 35, createTime: new Date() },
    { _id: 'ch_09', subjectId: 'sub_02', name: '德育与班级管理', sort: 4, questionCount: 25, createTime: new Date() },
    { _id: 'ch_10', subjectId: 'sub_02', name: '教育评价与改革', sort: 5, questionCount: 25, createTime: new Date() },
    { _id: 'ch_11', subjectId: 'sub_03', name: '教育学', sort: 1, questionCount: 50, createTime: new Date() },
    { _id: 'ch_12', subjectId: 'sub_03', name: '心理学', sort: 2, questionCount: 40, createTime: new Date() },
    { _id: 'ch_13', subjectId: 'sub_03', name: '教育法规', sort: 3, questionCount: 30, createTime: new Date() },
    { _id: 'ch_14', subjectId: 'sub_03', name: '新课改理念', sort: 4, questionCount: 40, createTime: new Date() }
  ];
  result.inserted.chapters = await upsertAll('chapters', chapters);

  // ==================== 题目 ====================
  var questions = [
    {
      _id: 'q_001', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_01',
      type: 'single', difficulty: 2, source: '2023上教资真题',
      question: '<p>素质教育是以<span style="color:red">提高民族素质</span>为宗旨的教育，它面向</p>',
      options: [
        { label: 'A', text: '全体学生' },
        { label: 'B', text: '优秀学生' },
        { label: 'C', text: '后进学生' },
        { label: 'D', text: '有特长的学生' }
      ],
      answer: 'A',
      analysis: '<p>素质教育是面向全体学生的教育，强调促进每个学生的发展，而不是只关注少数优秀学生或后进生。</p>',
      knowledgeTags: [{ name: '素质教育', detail: '素质教育以提高国民素质为根本宗旨，面向全体学生，促进学生全面发展与个性发展。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_002', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_01',
      type: 'single', difficulty: 3, source: '2022下教资真题',
      question: '<p>"以人为本"的学生观要求教师</p>',
      options: [
        { label: 'A', text: '把学生看作知识的容器' },
        { label: 'B', text: '把学生看作被动接受者' },
        { label: 'C', text: '把学生看作发展的人' },
        { label: 'D', text: '把学生看作标准化的产品' }
      ],
      answer: 'C',
      analysis: '<p>"以人为本"的学生观认为学生是发展的人、独特的人、具有独立意义的人。教师应尊重学生的个体差异，促进其主动发展。</p>',
      knowledgeTags: [{ name: '学生观', detail: '以人为本的学生观：学生是发展的人、独特的人、独立意义的人。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_003', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_01',
      type: 'single', difficulty: 2,
      question: '<p>教师职业的最大特点是职业角色的</p>',
      options: [
        { label: 'A', text: '单一性' },
        { label: 'B', text: '示范性' },
        { label: 'C', text: '多样性' },
        { label: 'D', text: '创造性' }
      ],
      answer: 'C',
      analysis: '<p>教师职业角色的最大特点是多样化。教师不仅是知识的传授者，还是学生的引导者、管理者、研究者等。</p>',
      knowledgeTags: [{ name: '教师角色', detail: '教师职业角色具有多样化的特点。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_004', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_01',
      type: 'judge', difficulty: 1,
      question: '<p>素质教育就是让学生什么都学、什么都学好。</p>',
      options: [
        { label: 'A', text: '正确' },
        { label: 'B', text: '错误' }
      ],
      answer: 'B',
      analysis: '<p>素质教育不是要求所有学生什么都学、什么都学好，而是强调在全面发展的基础上，促进学生的个性发展和特长培养。</p>',
      knowledgeTags: [{ name: '素质教育', detail: '素质教育强调全面发展与个性发展相结合。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_005', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_02',
      type: 'single', difficulty: 3, source: '2023上教资真题',
      question: '<p>《中华人民共和国教育法》规定，我国实行的学校教育制度是</p>',
      options: [
        { label: 'A', text: '学前教育、初等教育、中等教育、高等教育' },
        { label: 'B', text: '幼儿教育、基础教育、高等教育' },
        { label: 'C', text: '小学教育、中学教育、大学教育' },
        { label: 'D', text: '义务教育、高中教育、职业教育' }
      ],
      answer: 'A',
      analysis: '<p>《教育法》第十七条规定：国家实行学前教育、初等教育、中等教育、高等教育的学校教育制度。</p>',
      knowledgeTags: [{ name: '教育制度', detail: '我国学校教育制度分为学前教育、初等教育、中等教育、高等教育四个层次。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_006', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_02',
      type: 'single', difficulty: 2,
      question: '<p>教师应当履行"不断提高思想政治觉悟和教育教学业务水平"的义务，这属于</p>',
      options: [
        { label: 'A', text: '公民义务' },
        { label: 'B', text: '教育义务' },
        { label: 'C', text: '职业道德义务' },
        { label: 'D', text: '法律义务' }
      ],
      answer: 'D',
      analysis: '<p>《教师法》第八条明确规定了教师应履行的六项义务，其中包含"不断提高思想政治觉悟和教育教学业务水平"，这是法律义务。</p>',
      knowledgeTags: [{ name: '教师义务', detail: '教师的义务由《教师法》明确规定，属于法律义务。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_007', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_06',
      type: 'single', difficulty: 3, source: '2023上教资真题',
      question: '<p>提出"教育即生活""学校即社会""从做中学"的教育家是</p>',
      options: [
        { label: 'A', text: '赫尔巴特' },
        { label: 'B', text: '杜威' },
        { label: 'C', text: '夸美纽斯' },
        { label: 'D', text: '卢梭' }
      ],
      answer: 'B',
      analysis: '<p>杜威是实用主义教育学的代表人物，提出了"教育即生活""学校即社会""从做中学"三大核心教育理念。</p>',
      knowledgeTags: [{ name: '杜威', detail: '杜威(Dewey)实用主义教育学：教育即生活、学校即社会、从做中学。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_008', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_06',
      type: 'single', difficulty: 2,
      question: '<p>教育学作为一门独立学科的标志是</p>',
      options: [
        { label: 'A', text: '《大教学论》的出版' },
        { label: 'B', text: '《普通教育学》的出版' },
        { label: 'C', text: '《教育漫话》的出版' },
        { label: 'D', text: '《民主主义与教育》的出版' }
      ],
      answer: 'A',
      analysis: '<p>夸美纽斯的《大教学论》（1632年）标志着教育学开始成为一门独立的学科。赫尔巴特的《普通教育学》标志着教育学成为一门规范的学科。</p>',
      knowledgeTags: [{ name: '教育学的独立', detail: '《大教学论》——教育学成为独立学科的标志；《普通教育学》——教育学成为规范学科的标志。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_009', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_07',
      type: 'single', difficulty: 3, source: '2022下教资真题',
      question: '<p>小明听到音乐就会不由自主地跟着节奏晃动身体，这种心理现象属于</p>',
      options: [
        { label: 'A', text: '感觉' },
        { label: 'B', text: '知觉' },
        { label: 'C', text: '注意' },
        { label: 'D', text: '联觉' }
      ],
      answer: 'D',
      analysis: '<p>联觉是指一种感觉引起另一种感觉的心理现象。听到音乐（听觉）引起身体晃动（动觉），属于联觉。</p>',
      knowledgeTags: [{ name: '感觉与知觉', detail: '联觉是一种感觉引发出另一种感觉的现象。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_010', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_07',
      type: 'multi', difficulty: 4,
      question: '<p>下列属于无意注意的影响因素的是</p>',
      options: [
        { label: 'A', text: '刺激物的强度' },
        { label: 'B', text: '刺激物的对比关系' },
        { label: 'C', text: '个人的兴趣和需要' },
        { label: 'D', text: '活动的目的和任务' },
        { label: 'E', text: '对活动的间接兴趣' }
      ],
      answer: 'ABC',
      analysis: '<p>无意注意的影响因素包括客观因素（刺激物的强度、对比关系、新异性、运动变化等）和主观因素（个人的需要、兴趣、情绪状态等）。D和E指向有意注意。</p>',
      knowledgeTags: [{ name: '注意的种类', detail: '无意注意受主客观因素影响；有意注意受目的任务和间接兴趣影响。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_011', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_11',
      type: 'single', difficulty: 3, source: '2023教师招聘真题',
      question: '<p>教学过程是一种特殊的认识过程，其特殊性表现在</p>',
      options: [
        { label: 'A', text: '间接性与简捷性' },
        { label: 'B', text: '直观性与巩固性' },
        { label: 'C', text: '启发性与循序性' },
        { label: 'D', text: '思维性与实践性' }
      ],
      answer: 'A',
      analysis: '<p>教学过程的特殊性主要体现在：间接性（以学习间接经验为主）、简捷性（快速掌握）、引导性（教师引导）、教育性（教书育人）。</p>',
      knowledgeTags: [{ name: '教学过程', detail: '教学过程的特殊性：间接性、简捷性、引导性、教育性。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_012', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_11',
      type: 'single', difficulty: 2,
      question: '<p>"不愤不启，不悱不发"体现了什么教学原则？</p>',
      options: [
        { label: 'A', text: '循序渐进原则' },
        { label: 'B', text: '启发性原则' },
        { label: 'C', text: '因材施教原则' },
        { label: 'D', text: '巩固性原则' }
      ],
      answer: 'B',
      analysis: '<p>"不愤不启，不悱不发"出自《论语》，意思是学生不冥思苦想就不去启发他，不表达不出来就不去开导他。体现了启发性教学原则。</p>',
      knowledgeTags: [{ name: '教学原则', detail: '启发性原则是指在教学中教师要激发学生的学习主动性，引导他们独立思考。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_013', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_12',
      type: 'single', difficulty: 3,
      question: '<p>艾宾浩斯遗忘曲线揭示的遗忘规律是</p>',
      options: [
        { label: 'A', text: '先慢后快' },
        { label: 'B', text: '先快后慢' },
        { label: 'C', text: '匀速递减' },
        { label: 'D', text: '波浪式变化' }
      ],
      answer: 'B',
      analysis: '<p>艾宾浩斯遗忘曲线表明：遗忘的进程是不均衡的，呈现"先快后慢"的趋势。在记忆后的最初阶段遗忘速度最快，之后逐渐减慢。</p>',
      knowledgeTags: [{ name: '遗忘规律', detail: '艾宾浩斯遗忘曲线：遗忘先快后慢，及时复习可有效防止遗忘。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_014', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_12',
      type: 'judge', difficulty: 2,
      question: '<p>智力水平越高，创造力水平就越高。</p>',
      options: [
        { label: 'A', text: '正确' },
        { label: 'B', text: '错误' }
      ],
      answer: 'B',
      analysis: '<p>智力与创造力的关系是：高智力是创造力的必要条件，但不是充分条件。高智力不一定高创造力，但低智力一定低创造力。</p>',
      knowledgeTags: [{ name: '智力与创造力', detail: '高智力是高创造力的必要条件而非充分条件。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_015', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_13',
      type: 'single', difficulty: 3, source: '2022教师招聘真题',
      question: '<p>根据《中华人民共和国教师法》，教师的平均工资水平应当</p>',
      options: [
        { label: 'A', text: '不低于当地公务员平均水平' },
        { label: 'B', text: '不低于国家公务员平均水平' },
        { label: 'C', text: '不低于当地公务员水平' },
        { label: 'D', text: '不低于国家公务员水平' }
      ],
      answer: 'A',
      analysis: '<p>《教师法》第二十五条规定：教师的平均工资水平应当不低于或者高于国家公务员的平均工资水平，并逐步提高。具体执行以"不低于当地公务员平均水平"为准。</p>',
      knowledgeTags: [{ name: '教师权益', detail: '教师工资不低于当地公务员平均水平。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_016', examTypeId: 'exam_03', subjectId: 'sub_05', chapterId: 'ch_11',
      type: 'single', difficulty: 3, source: '2023特岗真题',
      question: '<p>特岗教师聘期一般为</p>',
      options: [
        { label: 'A', text: '1年' },
        { label: 'B', text: '2年' },
        { label: 'C', text: '3年' },
        { label: 'D', text: '5年' }
      ],
      answer: 'C',
      analysis: '<p>特岗教师聘期一般为3年。服务期满且考核合格，可按照规定办理编制、接续工龄等。</p>',
      knowledgeTags: [{ name: '特岗政策', detail: '特岗教师服务期为3年。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_017', examTypeId: 'exam_03', subjectId: 'sub_05', chapterId: 'ch_11',
      type: 'essay', difficulty: 4,
      question: '<p>结合实际，谈谈如何促进教育公平？</p>',
      options: [],
      answer: '<p>促进教育公平的措施包括：</p><p>1. 均衡配置教育资源，加大对农村和薄弱学校的投入；</p><p>2. 推进义务教育均衡发展，缩小城乡、区域、校际差距；</p><p>3. 保障特殊群体受教育权利，如随迁子女、留守儿童等；</p><p>4. 完善资助体系，不让一个学生因家庭经济困难而失学；</p><p>5. 提高教育信息化水平，让优质教育资源惠及更多学生。</p>',
      analysis: '<p>教育公平是社会公平的重要基础。包括机会公平、过程公平和结果公平三个层次。</p>',
      knowledgeTags: [{ name: '教育公平', detail: '教育公平包括机会公平、过程公平、结果公平三个层次。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_018', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_02',
      type: 'single', difficulty: 2, source: '2021下教资真题',
      question: '<p>《中华人民共和国义务教育法》规定，适龄儿童、少年免试就近入学。这一规定体现了义务教育的</p>',
      options: [
        { label: 'A', text: '强制性' },
        { label: 'B', text: '免费性' },
        { label: 'C', text: '普及性' },
        { label: 'D', text: '公平性' }
      ],
      answer: 'D',
      analysis: '<p>免试就近入学的规定体现了义务教育的公平性，保障每个适龄儿童、少年平等接受教育的机会，避免择校竞争带来的教育不公。</p>',
      knowledgeTags: [{ name: '义务教育特性', detail: '义务教育具有强制性、免费性、普及性、公平性等特征。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_019', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_02',
      type: 'single', difficulty: 3,
      question: '<p>《未成年人保护法》规定，学校不得使未成年学生在危及人身安全、健康的校舍和其他教育教学设施中活动。这体现了对未成年人的</p>',
      options: [
        { label: 'A', text: '家庭保护' },
        { label: 'B', text: '学校保护' },
        { label: 'C', text: '社会保护' },
        { label: 'D', text: '司法保护' }
      ],
      answer: 'B',
      analysis: '<p>《未成年人保护法》规定了家庭保护、学校保护、社会保护、司法保护、网络保护、政府保护六大保护。学校对校舍及设施安全的责任属于学校保护。</p>',
      knowledgeTags: [{ name: '未成年人保护', detail: '未成年人保护包括家庭、学校、社会、司法、网络、政府六大保护。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_020', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_02',
      type: 'judge', difficulty: 2,
      question: '<p>《教师法》规定，教师有权对学校教育教学、管理工作和教育行政部门的工作提出意见和建议，这是教师的民主管理权。</p>',
      options: [
        { label: 'A', text: '正确' },
        { label: 'B', text: '错误' }
      ],
      answer: 'A',
      analysis: '<p>《教师法》第七条规定教师享有六大权利，其中包括"对学校教育教学、管理工作和教育行政部门的工作提出意见和建议，通过教职工代表大会或者其他形式，参与学校的民主管理"，即民主管理权。</p>',
      knowledgeTags: [{ name: '教师权利', detail: '教师享有教育教学权、学术研究权、管理学生权、获取报酬权、民主管理权、进修培训权六项权利。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_021', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_02',
      type: 'multi', difficulty: 4, source: '2022上教资真题',
      question: '<p>根据《中华人民共和国教师法》，下列属于教师享有的权利的是</p>',
      options: [
        { label: 'A', text: '教育教学权' },
        { label: 'B', text: '科学研究权' },
        { label: 'C', text: '管理学生权' },
        { label: 'D', text: '获取工资报酬权' },
        { label: 'E', text: '随意开除学生权' }
      ],
      answer: 'ABCD',
      analysis: '<p>《教师法》第七条规定教师享有六项权利：教育教学权、科学研究权、管理学生权、获取报酬待遇权、民主管理权、进修培训权。E项错误，教师无权随意开除学生。</p>',
      knowledgeTags: [{ name: '教师权利', detail: '教师的六项法定权利：教育教学权、科学研究权、管理学生权、获取报酬权、民主管理权、进修培训权。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_022', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_03',
      type: 'single', difficulty: 2, source: '2023上教资真题',
      question: '<p>《中小学教师职业道德规范》（2008年修订）中，师德规范的核心内容是</p>',
      options: [
        { label: 'A', text: '爱岗敬业、教书育人、为人师表' },
        { label: 'B', text: '爱国守法、爱岗敬业、关爱学生' },
        { label: 'C', text: '教书育人、为人师表、终身学习' },
        { label: 'D', text: '关爱学生、教书育人、为人师表' }
      ],
      answer: 'A',
      analysis: '<p>2008年修订的《中小学教师职业道德规范》包括六条：爱国守法、爱岗敬业、关爱学生、教书育人、为人师表、终身学习。其中爱岗敬业、教书育人、为人师表是师德规范的核心内容。</p>',
      knowledgeTags: [{ name: '师德规范', detail: '2008版师德规范六条：爱国守法、爱岗敬业、关爱学生、教书育人、为人师表、终身学习。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_023', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_03',
      type: 'single', difficulty: 3,
      question: '<p>"为人师表"这一师德规范要求教师</p>',
      options: [
        { label: 'A', text: '只需在课堂教学中表现优秀即可' },
        { label: 'B', text: '衣着得体，语言规范，举止文明，以身作则' },
        { label: 'C', text: '只要业务能力强，其他方面可以忽略' },
        { label: 'D', text: '只要对学生严格就是好教师' }
      ],
      answer: 'B',
      analysis: '<p>"为人师表"要求教师坚守高尚情操，知荣明耻，严于律己，以身作则；衣着得体，语言规范，举止文明；关心集体，团结协作，尊重同事，尊重家长；作风正派，廉洁奉公。</p>',
      knowledgeTags: [{ name: '为人师表', detail: '为人师表强调教师以身作则，在衣着、语言、举止等方面做学生的表率。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_024', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_03',
      type: 'judge', difficulty: 2,
      question: '<p>教师关爱学生就是要满足学生的一切要求，对学生有求必应。</p>',
      options: [
        { label: 'A', text: '正确' },
        { label: 'B', text: '错误' }
      ],
      answer: 'B',
      analysis: '<p>关爱学生要求教师关心爱护全体学生，尊重学生人格，平等公正对待学生，对学生严慈相济，做学生良师益友。但关爱不是溺爱和迁就，对学生的不合理要求应当拒绝并进行正面引导。</p>',
      knowledgeTags: [{ name: '关爱学生', detail: '关爱学生要严慈相济，不是无原则的迁就。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_025', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_03',
      type: 'multi', difficulty: 3, source: '2022下教资真题',
      question: '<p>下列属于《中小学教师职业道德规范》（2008年）内容的是</p>',
      options: [
        { label: 'A', text: '爱国守法' },
        { label: 'B', text: '爱岗敬业' },
        { label: 'C', text: '关爱学生' },
        { label: 'D', text: '教书育人' },
        { label: 'E', text: '终身学习' }
      ],
      answer: 'ABCDE',
      analysis: '<p>2008年修订的《中小学教师职业道德规范》共六条：爱国守法、爱岗敬业、关爱学生、教书育人、为人师表、终身学习。五个选项全部正确。</p>',
      knowledgeTags: [{ name: '师德规范', detail: '2008版师德规范的六条内容是常考知识点。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_026', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_03',
      type: 'essay', difficulty: 4,
      question: '<p>结合实际，谈谈教师如何在教育教学实践中践行"教书育人"的师德规范？</p>',
      options: [],
      answer: '<p>教师践行"教书育人"应做到：</p><p>1. 遵循教育规律，实施素质教育。不以分数作为评价学生的唯一标准；</p><p>2. 循循善诱，诲人不倦，因材施教。关注学生个体差异，促进每个学生的发展；</p><p>3. 培养学生良好品行，激发学生创新精神，促进学生全面发展；</p><p>4. 不仅传授知识，更要引导学生做人，将德育贯穿于教学全过程；</p><p>5. 尊重学生人格，平等对待每一位学生，不歧视学困生和特殊学生。</p>',
      analysis: '<p>"教书育人"是教师的天职，要求教师在传授知识的同时培养学生良好品德，做到既教书又育人。</p>',
      knowledgeTags: [{ name: '教书育人', detail: '教书育人是教师职业道德的核心内容之一，强调教书与育人的统一。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_027', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_04',
      type: 'single', difficulty: 2,
      question: '<p>我国古代"四大发明"中，对世界航海事业发展产生重大影响的是</p>',
      options: [
        { label: 'A', text: '造纸术' },
        { label: 'B', text: '印刷术' },
        { label: 'C', text: '火药' },
        { label: 'D', text: '指南针' }
      ],
      answer: 'D',
      analysis: '<p>指南针的发明和应用为航海提供了方向指引，促进了欧洲航海家开辟新航路，对世界航海事业产生重大影响。造纸术和印刷术促进了文化传播，火药改变了战争方式。</p>',
      knowledgeTags: [{ name: '四大发明', detail: '中国古代四大发明：造纸术、印刷术、火药、指南针。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_028', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_04',
      type: 'single', difficulty: 3, source: '2023上教资真题',
      question: '<p>下列不属于"唐宋八大家"的是</p>',
      options: [
        { label: 'A', text: '韩愈' },
        { label: 'B', text: '柳宗元' },
        { label: 'C', text: '李白' },
        { label: 'D', text: '欧阳修' }
      ],
      answer: 'C',
      analysis: '<p>"唐宋八大家"指唐代的韩愈、柳宗元和宋代的欧阳修、苏洵、苏轼、苏辙、王安石、曾巩。李白是唐代诗人，不属于唐宋八大家。</p>',
      knowledgeTags: [{ name: '唐宋八大家', detail: '唐宋八大家：韩愈、柳宗元、欧阳修、苏洵、苏轼、苏辙、王安石、曾巩。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_029', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_04',
      type: 'single', difficulty: 2,
      question: '<p>文艺复兴运动发源于</p>',
      options: [
        { label: 'A', text: '法国' },
        { label: 'B', text: '英国' },
        { label: 'C', text: '意大利' },
        { label: 'D', text: '德国' }
      ],
      answer: 'C',
      analysis: '<p>文艺复兴运动14世纪发源于意大利，15世纪以后扩展到欧洲其他国家。代表人物有但丁、达·芬奇、莎士比亚等。</p>',
      knowledgeTags: [{ name: '文艺复兴', detail: '文艺复兴发源于意大利，代表人物有但丁、彼特拉克、薄伽丘、达·芬奇等。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_030', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_04',
      type: 'fill', difficulty: 3,
      question: '<p>中国传统二十四节气中，标志着春季开始的是______，标志着冬季开始的是______。</p>',
      options: [],
      answer: '立春；立冬',
      analysis: '<p>二十四节气中，立春标志着春季的开始，立夏标志着夏季的开始，立秋标志着秋季的开始，立冬标志着冬季的开始。二十四节气已被列入联合国教科文组织人类非物质文化遗产名录。</p>',
      knowledgeTags: [{ name: '二十四节气', detail: '二十四节气是中国古代订立的一种用来指导农事的补充历法。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_031', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_04',
      type: 'judge', difficulty: 2,
      question: '<p>《史记》是中国历史上第一部纪传体通史，由西汉司马迁所著。</p>',
      options: [
        { label: 'A', text: '正确' },
        { label: 'B', text: '错误' }
      ],
      answer: 'A',
      analysis: '<p>《史记》由西汉司马迁所著，是中国历史上第一部纪传体通史，记载了上至黄帝、下至汉武帝太初年间的历史，被鲁迅誉为"史家之绝唱，无韵之离骚"。</p>',
      knowledgeTags: [{ name: '史学常识', detail: '《史记》是纪传体通史的开山之作，与《汉书》《后汉书》《三国志》合称"前四史"。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_032', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_05',
      type: 'single', difficulty: 2,
      question: '<p>在Word文档中，要将一段文字设置为"加粗、居中、红色"，下列操作正确的是</p>',
      options: [
        { label: 'A', text: '选中文字后，依次点击"开始"选项卡中的B、居中、字体颜色按钮' },
        { label: 'B', text: '直接输入即可，无需选中' },
        { label: 'C', text: '只能通过快捷键实现' },
        { label: 'D', text: '只能在"插入"选项卡中设置' }
      ],
      answer: 'A',
      analysis: '<p>在Word中设置文字格式，应先选中文字，然后在"开始"选项卡中点击B（加粗）、居中对齐、字体颜色按钮进行设置。</p>',
      knowledgeTags: [{ name: 'Word操作', detail: 'Word文字格式设置需先选中文字再设置。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_033', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_05',
      type: 'single', difficulty: 3, source: '2022下教资真题',
      question: '<p>"所有的鱼都会游泳，鲸鱼会游泳，所以鲸鱼是鱼。"这一推理的错误在于</p>',
      options: [
        { label: 'A', text: '前提不真实' },
        { label: 'B', text: '推理形式不正确' },
        { label: 'C', text: '结论正确' },
        { label: 'D', text: '没有错误' }
      ],
      answer: 'B',
      analysis: '<p>该推理犯了"中项不周延"的逻辑错误。会游泳的不只是鱼，鲸鱼会游泳不能推出鲸鱼是鱼。这是一个无效的三段论推理。</p>',
      knowledgeTags: [{ name: '逻辑推理', detail: '三段论推理需要遵循一定的逻辑规则，中项至少要周延一次。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_034', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_05',
      type: 'single', difficulty: 2,
      question: '<p>阅读理解中，要把握文章的中心思想，最关键的是</p>',
      options: [
        { label: 'A', text: '记忆文章的所有细节' },
        { label: 'B', text: '找出文章的中心句和关键词' },
        { label: 'C', text: '快速浏览一遍即可' },
        { label: 'D', text: '背诵文章的开头和结尾' }
      ],
      answer: 'B',
      analysis: '<p>把握文章中心思想的关键是找出文章的中心句、关键词和主题段落，通过对这些核心要素的分析来理解作者的写作意图。</p>',
      knowledgeTags: [{ name: '阅读理解', detail: '阅读理解要善于抓住中心句、关键词、过渡句等核心要素。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_035', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_05',
      type: 'fill', difficulty: 3,
      question: '<p>在PowerPoint中，要使幻灯片自动切换，应在"切换"选项卡中设置______；要为某一对象添加动画效果，应使用"______"选项卡。</p>',
      options: [],
      answer: '设置自动换片时间；动画',
      analysis: '<p>在PPT中，自动切换幻灯片需在"切换"选项卡中勾选"设置自动换片时间"并设置时间间隔；为对象添加动画效果需在"动画"选项卡中操作，包括进入、强调、退出、动作路径等动画类型。</p>',
      knowledgeTags: [{ name: 'PPT操作', detail: 'PPT的切换效果和动画效果是基本操作技能。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_036', examTypeId: 'exam_01', subjectId: 'sub_01', chapterId: 'ch_05',
      type: 'judge', difficulty: 2,
      question: '<p>多媒体课件越精美、动画越多，教学效果就越好。</p>',
      options: [
        { label: 'A', text: '正确' },
        { label: 'B', text: '错误' }
      ],
      answer: 'B',
      analysis: '<p>多媒体课件应服务于教学目标和内容，过多动画和精美设计可能分散学生注意力，影响教学效果。课件设计应遵循适度原则，突出教学重点。</p>',
      knowledgeTags: [{ name: '课件设计', detail: '多媒体课件设计应遵循教育性、科学性、技术性、艺术性相结合的原则。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_037', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_06',
      type: 'single', difficulty: 3, source: '2023上教资真题',
      question: '<p>在教育目的的价值取向上，主张"教育为完美的成人生活作准备"的代表人物是</p>',
      options: [
        { label: 'A', text: '杜威' },
        { label: 'B', text: '斯宾塞' },
        { label: 'C', text: '卢梭' },
        { label: 'D', text: '赫尔巴特' }
      ],
      answer: 'B',
      analysis: '<p>斯宾塞是"教育准备生活说"的代表，主张"教育为完美的成人生活作准备"。杜威则提出"教育即生活"，强调教育就是生活本身的过程。</p>',
      knowledgeTags: [{ name: '教育目的理论', detail: '教育目的理论主要有社会本位论、个人本位论、生活准备说、教育即生活等。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_038', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_06',
      type: 'single', difficulty: 2,
      question: '<p>按照课程内容的组织方式，可将课程分为</p>',
      options: [
        { label: 'A', text: '学科课程和活动课程' },
        { label: 'B', text: '分科课程和综合课程' },
        { label: 'C', text: '必修课程和选修课程' },
        { label: 'D', text: '显性课程和隐性课程' }
      ],
      answer: 'B',
      analysis: '<p>按课程内容的组织方式，课程分为分科课程（按学科逻辑组织）和综合课程（综合多学科内容）。A是按学科固有的属性分，C是按对学生学习要求分，D是按课程呈现方式分。</p>',
      knowledgeTags: [{ name: '课程类型', detail: '课程类型按不同标准可分为多种：学科/活动课程、分科/综合课程、必修/选修课程、显性/隐性课程等。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_039', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_06',
      type: 'multi', difficulty: 3, source: '2022下教资真题',
      question: '<p>下列属于影响人身心发展的因素的是</p>',
      options: [
        { label: 'A', text: '遗传素质' },
        { label: 'B', text: '环境' },
        { label: 'C', text: '学校教育' },
        { label: 'D', text: '个体的主观能动性' },
        { label: 'E', text: '家庭经济条件' }
      ],
      answer: 'ABCD',
      analysis: '<p>影响人身心发展的因素主要有四个：遗传素质（物质前提）、环境（外部条件）、学校教育（主导作用）、个体主观能动性（决定性因素）。家庭经济条件属于环境因素的一部分，不是独立因素。</p>',
      knowledgeTags: [{ name: '影响人发展的因素', detail: '遗传、环境、教育、主观能动性是影响人身心发展的四大因素。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_040', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_06',
      type: 'judge', difficulty: 2,
      question: '<p>学校教育在人的身心发展中起主导作用。</p>',
      options: [
        { label: 'A', text: '正确' },
        { label: 'B', text: '错误' }
      ],
      answer: 'A',
      analysis: '<p>学校教育具有目的性、计划性、系统性、组织性，由专业教师实施，在人的身心发展中起主导作用。但学校教育的作用不能脱离其他因素的配合。</p>',
      knowledgeTags: [{ name: '学校教育的作用', detail: '学校教育在人的发展中起主导作用，但不能取代其他因素。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_041', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_07',
      type: 'single', difficulty: 3, source: '2023上教资真题',
      question: '<p>心理学研究表明，短时记忆的容量大约是</p>',
      options: [
        { label: 'A', text: '5±2个组块' },
        { label: 'B', text: '7±2个组块' },
        { label: 'C', text: '9±2个组块' },
        { label: 'D', text: '无限' }
      ],
      answer: 'B',
      analysis: '<p>米勒的研究表明，短时记忆的容量为7±2个组块。通过组块化可以扩大短时记忆的信息量。短时记忆保持时间约为5秒到1分钟。</p>',
      knowledgeTags: [{ name: '记忆的分类', detail: '感觉记忆、短时记忆、长时记忆是记忆的三种类型，容量和保持时间各不相同。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_042', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_07',
      type: 'single', difficulty: 2,
      question: '<p>思维的基本特征是</p>',
      options: [
        { label: 'A', text: '直接性和概括性' },
        { label: 'B', text: '间接性和概括性' },
        { label: 'C', text: '直观性和抽象性' },
        { label: 'D', text: '形象性和逻辑性' }
      ],
      answer: 'B',
      analysis: '<p>思维具有间接性和概括性两个基本特征。间接性指通过媒介认识事物；概括性指抽取一类事物的共同特征和本质属性。</p>',
      knowledgeTags: [{ name: '思维的特征', detail: '思维是人脑对客观事物间接的、概括的反映。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_043', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_07',
      type: 'multi', difficulty: 3,
      question: '<p>注意的品质包括</p>',
      options: [
        { label: 'A', text: '注意的广度' },
        { label: 'B', text: '注意的稳定性' },
        { label: 'C', text: '注意的分配' },
        { label: 'D', text: '注意的转移' },
        { label: 'E', text: '注意的强度' }
      ],
      answer: 'ABCD',
      analysis: '<p>注意的品质包括：注意的广度（数量）、注意的稳定性（时间）、注意的分配（同时进行多项活动）、注意的转移（主动从一活动转向另一活动）。注意没有"强度"这一品质。</p>',
      knowledgeTags: [{ name: '注意的品质', detail: '注意的四大品质：广度、稳定性、分配、转移。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_044', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_08',
      type: 'single', difficulty: 3, source: '2023上教资真题',
      question: '<p>皮亚杰将儿童认知发展分为四个阶段，其中具体运算阶段的儿童年龄大约为</p>',
      options: [
        { label: 'A', text: '0-2岁' },
        { label: 'B', text: '2-7岁' },
        { label: 'C', text: '7-11岁' },
        { label: 'D', text: '11岁以后' }
      ],
      answer: 'C',
      analysis: '<p>皮亚杰认知发展四阶段：感知运动阶段（0-2岁）、前运算阶段（2-7岁）、具体运算阶段（7-11岁）、形式运算阶段（11岁以后）。具体运算阶段的儿童获得了守恒概念，能进行具体逻辑推理。</p>',
      knowledgeTags: [{ name: '皮亚杰认知发展阶段', detail: '皮亚杰将儿童认知发展分为感知运动、前运算、具体运算、形式运算四个阶段。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_045', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_08',
      type: 'single', difficulty: 3,
      question: '<p>维果茨基提出的"最近发展区"理论说明</p>',
      options: [
        { label: 'A', text: '教育应适应儿童的发展水平' },
        { label: 'B', text: '教育应走在发展的前面' },
        { label: 'C', text: '教育与发展同步进行' },
        { label: 'D', text: '教育对发展没有影响' }
      ],
      answer: 'B',
      analysis: '<p>维果茨基认为儿童有两种发展水平：现有发展水平和潜在发展水平，两者之间的差距就是"最近发展区"。教学应走在发展的前面，创造最近发展区，促进儿童发展。</p>',
      knowledgeTags: [{ name: '最近发展区', detail: '维果茨基的最近发展区理论强调教学应走在发展的前面。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_046', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_08',
      type: 'single', difficulty: 2,
      question: '<p>奥苏贝尔根据学习材料与学习者原有知识结构的关系，将学习分为</p>',
      options: [
        { label: 'A', text: '接受学习和发现学习' },
        { label: 'B', text: '机械学习和有意义学习' },
        { label: 'C', text: '符号学习、概念学习和命题学习' },
        { label: 'D', text: '信号学习和刺激反应学习' }
      ],
      answer: 'B',
      analysis: '<p>奥苏贝尔根据学习材料与学习者原有知识结构的关系，将学习分为机械学习和有意义学习。根据学习方式分为接受学习和发现学习。两个维度交叉形成四种学习类型。</p>',
      knowledgeTags: [{ name: '奥苏贝尔学习分类', detail: '奥苏贝尔的有意义学习理论是教育心理学的重要理论。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_047', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_08',
      type: 'multi', difficulty: 4, source: '2022下教资真题',
      question: '<p>学习策略根据其在信息加工中所起的作用，可分为</p>',
      options: [
        { label: 'A', text: '认知策略' },
        { label: 'B', text: '元认知策略' },
        { label: 'C', text: '资源管理策略' },
        { label: 'D', text: '复述策略' },
        { label: 'E', text: '精加工策略' }
      ],
      answer: 'ABC',
      analysis: '<p>学习策略按信息加工作用分为三大类：认知策略、元认知策略、资源管理策略。D和E（复述策略、精加工策略）属于认知策略的下位分类。</p>',
      knowledgeTags: [{ name: '学习策略', detail: '学习策略分为认知策略、元认知策略、资源管理策略三大类。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_048', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_08',
      type: 'judge', difficulty: 3,
      question: '<p>正强化和负强化的目的都是增加行为发生的频率。</p>',
      options: [
        { label: 'A', text: '正确' },
        { label: 'B', text: '错误' }
      ],
      answer: 'A',
      analysis: '<p>正强化是通过呈现愉快刺激增加行为频率，负强化是通过撤销厌恶刺激增加行为频率。两者目的都是增加行为发生的概率，区别在于刺激的操作方式不同。注意负强化不同于惩罚。</p>',
      knowledgeTags: [{ name: '强化理论', detail: '正强化和负强化都是增加行为频率，惩罚是减少行为频率。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_049', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_09',
      type: 'single', difficulty: 3, source: '2023上教资真题',
      question: '<p>德育过程的基本规律之一是"学生的知、情、意、行诸因素统一发展的过程"，其中"知"是指</p>',
      options: [
        { label: 'A', text: '道德情感' },
        { label: 'B', text: '道德认识' },
        { label: 'C', text: '道德意志' },
        { label: 'D', text: '道德行为' }
      ],
      answer: 'B',
      analysis: '<p>德育过程是培养学生知、情、意、行的过程。"知"即道德认识，是对道德规范的理解和掌握；"情"即道德情感；"意"即道德意志；"行"即道德行为。一般以"知"为开端，以"行"为终结。</p>',
      knowledgeTags: [{ name: '德育过程规律', detail: '德育过程是学生知、情、意、行统一发展的过程。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_050', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_09',
      type: 'single', difficulty: 2,
      question: '<p>班主任工作的中心环节是</p>',
      options: [
        { label: 'A', text: '了解和研究学生' },
        { label: 'B', text: '组织和培养班集体' },
        { label: 'C', text: '做好个别教育工作' },
        { label: 'D', text: '协调校内外各种教育力量' }
      ],
      answer: 'B',
      analysis: '<p>班主任工作的中心环节是组织和培养班集体。了解和研究学生是班主任工作的前提和基础。</p>',
      knowledgeTags: [{ name: '班主任工作', detail: '班主任工作的前提是了解学生，中心环节是组织和培养班集体。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_051', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_09',
      type: 'multi', difficulty: 3,
      question: '<p>下列属于班级管理模式的是</p>',
      options: [
        { label: 'A', text: '常规管理' },
        { label: 'B', text: '平行管理' },
        { label: 'C', text: '民主管理' },
        { label: 'D', text: '目标管理' },
        { label: 'E', text: '随意管理' }
      ],
      answer: 'ABCD',
      analysis: '<p>班级管理模式主要包括：常规管理（通过规章制度）、平行管理（马卡连柯提出，集体与个人并行管理）、民主管理（吸收学生参与）、目标管理（围绕目标展开）。E项错误。</p>',
      knowledgeTags: [{ name: '班级管理模式', detail: '班级管理有常规管理、平行管理、民主管理、目标管理四种主要模式。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_052', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_09',
      type: 'fill', difficulty: 3,
      question: '<p>班集体形成的基础是______，班集体的核心是______。</p>',
      options: [],
      answer: '明确的共同目标；领导核心（班委会）',
      analysis: '<p>班集体的基本特征包括：明确的共同目标（基础）、一定的组织结构（核心是班委会和班级骨干）、一定的共同生活准则（纪律）、平等的心理氛围。共同目标是班集体形成的基础和前进的动力。</p>',
      knowledgeTags: [{ name: '班集体', detail: '班集体的特征包括共同目标、组织结构、行为准则、心理氛围。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_053', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_10',
      type: 'single', difficulty: 3, source: '2022下教资真题',
      question: '<p>在教学过程中，为调节和完善教学活动、保证教学目标完成而进行的评价是</p>',
      options: [
        { label: 'A', text: '诊断性评价' },
        { label: 'B', text: '形成性评价' },
        { label: 'C', text: '总结性评价' },
        { label: 'D', text: '相对性评价' }
      ],
      answer: 'B',
      analysis: '<p>形成性评价是在教学过程中进行的评价，目的是及时反馈信息、调节教学、完善教学过程。诊断性评价在教学前进行，总结性评价在教学后进行。</p>',
      knowledgeTags: [{ name: '教学评价', detail: '按评价时间和功能分为诊断性评价、形成性评价、总结性评价。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_054', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_10',
      type: 'single', difficulty: 2,
      question: '<p>新一轮基础教育课程改革的核心理念是</p>',
      options: [
        { label: 'A', text: '以教师为中心' },
        { label: 'B', text: '以知识传授为中心' },
        { label: 'C', text: '以学生发展为本' },
        { label: 'D', text: '以分数为中心' }
      ],
      answer: 'C',
      analysis: '<p>新课改的核心理念是"以学生发展为本"，强调为了每一位学生的发展，关注学生的全面发展、个性发展和可持续发展。</p>',
      knowledgeTags: [{ name: '新课改理念', detail: '新课改核心理念：一切为了每一位学生的发展。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_055', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_10',
      type: 'multi', difficulty: 3,
      question: '<p>下列属于新课改倡导的评价理念的是</p>',
      options: [
        { label: 'A', text: '发展性评价' },
        { label: 'B', text: '评价主体多元化' },
        { label: 'C', text: '评价方式多样化' },
        { label: 'D', text: '注重过程性评价' },
        { label: 'E', text: '仅以分数评价学生' }
      ],
      answer: 'ABCD',
      analysis: '<p>新课改倡导发展性评价，强调评价主体多元化、评价方式多样化、注重过程性评价，改变过去过分强调甄别与选拔的功能，建立促进学生全面发展的评价体系。E项错误。</p>',
      knowledgeTags: [{ name: '评价改革', detail: '新课改要求建立发展性评价体系，改变单一分数评价模式。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_056', examTypeId: 'exam_01', subjectId: 'sub_02', chapterId: 'ch_10',
      type: 'judge', difficulty: 2,
      question: '<p>相对性评价是通过将学生成绩排名次来判断其学习优劣的评价方法。</p>',
      options: [
        { label: 'A', text: '正确' },
        { label: 'B', text: '错误' }
      ],
      answer: 'A',
      analysis: '<p>相对性评价（常模参照评价）是以学生所在群体的整体状况为参考，通过排名次比较个体在群体中的相对位置。常用于选拔性考试。绝对性评价则以客观标准为参照。</p>',
      knowledgeTags: [{ name: '评价类型', detail: '相对性评价与绝对性评价是按评价参照标准划分的两种类型。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_057', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_11',
      type: 'single', difficulty: 3, source: '2023教师招聘真题',
      question: '<p>教学的教育性规律是指</p>',
      options: [
        { label: 'A', text: '教学永远具有教育性' },
        { label: 'B', text: '教学只有德育功能' },
        { label: 'C', text: '教学不需要德育' },
        { label: 'D', text: '教学与德育无关' }
      ],
      answer: 'A',
      analysis: '<p>教学的教育性规律（教育性教学）由赫尔巴特提出，即教学永远具有教育性。在任何教学过程中，教师在传授知识的同时，必然会对学生的思想品德产生影响。</p>',
      knowledgeTags: [{ name: '教学规律', detail: '教学的教育性规律是赫尔巴特提出的，强调教书与育人的统一。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_058', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_12',
      type: 'single', difficulty: 3,
      question: '<p>世界上第一个标准化智力测验是</p>',
      options: [
        { label: 'A', text: '斯坦福-比纳智力量表' },
        { label: 'B', text: '比纳-西蒙智力量表' },
        { label: 'C', text: '韦克斯勒智力量表' },
        { label: 'D', text: '瑞文标准推理测验' }
      ],
      answer: 'B',
      analysis: '<p>1905年，法国心理学家比纳和西蒙编制了世界上第一个标准化智力测验——比纳-西蒙智力量表，用于鉴别需要特殊教育的儿童。斯坦福-比纳量表是其修订版。</p>',
      knowledgeTags: [{ name: '智力测验', detail: '比纳-西蒙量表是世界上第一个标准化智力测验，由比纳和西蒙于1905年编制。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_059', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_12',
      type: 'single', difficulty: 2,
      question: '<p>情绪与情感的主要区别是</p>',
      options: [
        { label: 'A', text: '情绪是高级的，情感是低级的' },
        { label: 'B', text: '情绪是低级的，情感是高级的' },
        { label: 'C', text: '情绪和情感没有区别' },
        { label: 'D', text: '情感是天生的，情绪是后天形成的' }
      ],
      answer: 'B',
      analysis: '<p>情绪是与生理需要相联系的、低级的、不稳定的体验；情感是与人的社会性需要相联系的、高级的、稳定的体验。情绪具有情境性和动摇性，情感具有稳定性和深刻性。</p>',
      knowledgeTags: [{ name: '情绪与情感', detail: '情绪是低级的、与生理需要相联系；情感是高级的、与社会需要相联系。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_060', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_12',
      type: 'judge', difficulty: 2,
      question: '<p>气质无好坏之分，性格有优劣之别。</p>',
      options: [
        { label: 'A', text: '正确' },
        { label: 'B', text: '错误' }
      ],
      answer: 'A',
      analysis: '<p>气质是表现在心理活动的强度、速度、灵活性等方面的动力特征，是天生的，无好坏之分。性格是人对现实的稳定态度和习惯化的行为方式，是后天形成的，具有社会评价意义，有优劣之分。</p>',
      knowledgeTags: [{ name: '气质与性格', detail: '气质无好坏，性格有优劣。气质是先天的，性格是后天的。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_061', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_13',
      type: 'single', difficulty: 3, source: '2022教师招聘真题',
      question: '<p>《中华人民共和国教育法》规定，设立学校应当具备的基本条件不包括</p>',
      options: [
        { label: 'A', text: '有组织机构和章程' },
        { label: 'B', text: '有合格的教师' },
        { label: 'C', text: '有充足的学生生源' },
        { label: 'D', text: '有符合规定标准的教学场所及设施、设备等' }
      ],
      answer: 'C',
      analysis: '<p>《教育法》第二十七条规定，设立学校应当具备：组织机构和章程；合格的教师；符合规定标准的教学场所及设施、设备等；必备的办学资金和稳定的经费来源。"充足生源"不是设立学校的法定条件。</p>',
      knowledgeTags: [{ name: '学校设立条件', detail: '《教育法》规定了设立学校的四项基本条件。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_062', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_13',
      type: 'single', difficulty: 2,
      question: '<p>根据《义务教育法》，义务教育是国家统一实施的所有适龄儿童、少年必须接受的教育，是国家必须予以保障的</p>',
      options: [
        { label: 'A', text: '公益性事业' },
        { label: 'B', text: '营利性事业' },
        { label: 'C', text: '社会性事业' },
        { label: 'D', text: '福利性事业' }
      ],
      answer: 'A',
      analysis: '<p>《义务教育法》第二条规定：义务教育是国家统一实施的所有适龄儿童、少年必须接受的教育，是国家必须予以保障的公益性事业。义务教育不收学费、杂费。</p>',
      knowledgeTags: [{ name: '义务教育', detail: '义务教育是公益性事业，具有强制性、免费性、普及性。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_063', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_13',
      type: 'multi', difficulty: 3, source: '2023教师招聘真题',
      question: '<p>根据《教育法》，学生享有的权利包括</p>',
      options: [
        { label: 'A', text: '参加教育教学计划安排的各种活动' },
        { label: 'B', text: '使用教育教学设施、设备、图书资料' },
        { label: 'C', text: '按照国家规定获得奖学金、贷学金、助学金' },
        { label: 'D', text: '在学业成绩和品行上获得公正评价' },
        { label: 'E', text: '随意迟到早退' }
      ],
      answer: 'ABCD',
      analysis: '<p>《教育法》第四十三条规定学生享有：参加教育活动权、使用教育资源权、获得奖助学金权、获得公正评价权、申诉起诉权、法律法规规定的其他权利。E项是违纪行为，不属于学生权利。</p>',
      knowledgeTags: [{ name: '学生权利', detail: '《教育法》规定了学生享有的多项法定权利。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_064', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_13',
      type: 'judge', difficulty: 2,
      question: '<p>教师对违反纪律的学生可以适当进行体罚，以督促其改正。</p>',
      options: [
        { label: 'A', text: '正确' },
        { label: 'B', text: '错误' }
      ],
      answer: 'B',
      analysis: '<p>《义务教育法》《教师法》《未成年人保护法》等法律均明确规定禁止体罚和变相体罚学生。教师对违纪学生应采用正面教育、说服引导等方式，绝不能体罚。</p>',
      knowledgeTags: [{ name: '禁止体罚', detail: '我国法律明确规定禁止教师体罚和变相体罚学生。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_065', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_14',
      type: 'single', difficulty: 2, source: '2023教师招聘真题',
      question: '<p>新课程改革倡导的学习方式不包括</p>',
      options: [
        { label: 'A', text: '自主学习' },
        { label: 'B', text: '合作学习' },
        { label: 'C', text: '探究学习' },
        { label: 'D', text: '接受学习' }
      ],
      answer: 'D',
      analysis: '<p>新课改倡导自主学习、合作学习、探究学习三种学习方式，强调学生的主动性、合作性和探究性。接受学习是被动的、传统的学习方式，不属于新课改倡导的学习方式。</p>',
      knowledgeTags: [{ name: '学习方式', detail: '新课改三大学习方式：自主学习、合作学习、探究学习。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_066', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_14',
      type: 'single', difficulty: 3,
      question: '<p>新课程实行三级课程管理体制，这三级是</p>',
      options: [
        { label: 'A', text: '国家课程、地方课程、学校课程' },
        { label: 'B', text: '国家课程、省级课程、市级课程' },
        { label: 'C', text: '中央课程、地方课程、校本课程' },
        { label: 'D', text: '必修课程、选修课程、活动课程' }
      ],
      answer: 'A',
      analysis: '<p>新课改实行国家、地方、学校三级课程管理，增强课程对地方、学校及学生的适应性。国家课程体现国家意志，地方课程体现地方特色，学校课程（校本课程）体现学校特色。</p>',
      knowledgeTags: [{ name: '三级课程管理', detail: '国家课程、地方课程、学校课程构成三级课程管理体系。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_067', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_14',
      type: 'single', difficulty: 2,
      question: '<p>新课程改革在课程结构方面，整体设置九年一贯的义务教育课程，其中小学阶段以</p>',
      options: [
        { label: 'A', text: '分科课程为主' },
        { label: 'B', text: '综合课程为主' },
        { label: 'C', text: '活动课程为主' },
        { label: 'D', text: '选修课程为主' }
      ],
      answer: 'B',
      analysis: '<p>新课改规定：小学阶段以综合课程为主，初中阶段设置分科与综合相结合的课程，高中阶段以分科课程为主。这种结构体现了课程改革的综合性方向。</p>',
      knowledgeTags: [{ name: '课程结构', detail: '小学以综合课程为主，初中分科与综合结合，高中以分科为主。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_068', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_14',
      type: 'multi', difficulty: 4, source: '2022教师招聘真题',
      question: '<p>下列属于新课程改革的具体目标的是</p>',
      options: [
        { label: 'A', text: '实现课程功能的转变' },
        { label: 'B', text: '体现课程结构的均衡性、综合性和选择性' },
        { label: 'C', text: '密切课程内容与生活和时代的联系' },
        { label: 'D', text: '改善学生的学习方式' },
        { label: 'E', text: '取消教师的主导地位' }
      ],
      answer: 'ABCD',
      analysis: '<p>新课改的六项具体目标：实现课程功能转变；体现课程结构的均衡性、综合性和选择性；密切课程内容与生活和时代的联系；改善学生的学习方式；建立与素质教育理念相一致的评价与考试制度；实行三级课程管理。E项错误，新课改不取消教师主导地位，而是要求教师角色转变。</p>',
      knowledgeTags: [{ name: '新课改目标', detail: '新课改六项具体目标涵盖课程功能、结构、内容、学习方式、评价、管理六个方面。' }],
      createTime: new Date(), updateTime: new Date()
    },
    {
      _id: 'q_069', examTypeId: 'exam_02', subjectId: 'sub_03', chapterId: 'ch_14',
      type: 'essay', difficulty: 4,
      question: '<p>简述新课程改革的具体目标。</p>',
      options: [],
      answer: '<p>新课程改革的六项具体目标：</p><p>1. 实现课程功能的转变：从单纯注重传授知识转变为引导学生学会学习、学会合作、学会生存、学会做人；</p><p>2. 体现课程结构的均衡性、综合性和选择性：整体设置九年一贯的义务教育课程，设置综合实践活动课程；</p><p>3. 密切课程内容与生活和时代的联系：改变课程内容"难、繁、偏、旧"和过于注重书本知识的现状；</p><p>4. 改善学生的学习方式：改变课程实施过于强调接受学习、死记硬背、机械训练的现状，倡导自主、合作、探究学习；</p><p>5. 建立与素质教育理念相一致的评价与考试制度：发挥评价促进学生发展、教师提高和改进教学实践的功能；</p><p>6. 实行三级课程管理：改变课程管理过于集中的状况，实行国家、地方、学校三级课程管理。</p>',
      analysis: '<p>新课改六项具体目标是新课改理念的核心内容，需重点掌握。这六项目标相互联系、相互促进，共同推动素质教育的实施。</p>',
      knowledgeTags: [{ name: '新课改目标', detail: '新课改六项具体目标涵盖功能、结构、内容、方式、评价、管理六个维度。' }],
      createTime: new Date(), updateTime: new Date()
    }
  ];
  result.inserted.questions = await upsertAll('questions', questions);

  return result;
};

/** 幂等插入：按 _id 去重 */
async function upsertAll(collectionName, docs) {
  var inserted = 0, skipped = 0;
  for (var i = 0; i < docs.length; i++) {
    try {
      var existing = await db.collection(collectionName).doc(docs[i]._id).get();
      if (existing.data) {
        skipped++;
      } else {
        await db.collection(collectionName).add({ data: docs[i] });
        inserted++;
      }
    } catch (e) {
      // doc 不存在会抛出错误，此时直接插入
      try {
        await db.collection(collectionName).add({ data: docs[i] });
        inserted++;
      } catch (e2) {
        // 可能重复添加错误
        skipped++;
      }
    }
  }
  return { inserted: inserted, skipped: skipped, total: docs.length };
}
