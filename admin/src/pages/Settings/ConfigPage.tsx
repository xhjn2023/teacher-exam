import { useState } from 'react'
import {
  Bell,
  Check,
  FileText,
  Mail,
  Megaphone,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Timer,
} from 'lucide-react'
import type { SystemConfig } from '@/types'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  Input,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { systemConfig as initialConfig } from '@/mock/data/config'

// 邮箱校验
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// 开关组件
interface ToggleProps {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description?: string
}

function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-zinc-800">{label}</div>
        {description && (
          <div className="mt-0.5 text-xs text-zinc-500">{description}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-base',
          checked ? 'bg-primary-600' : 'bg-zinc-200'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-base',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  )
}

// 表单错误接口
interface ConfigFormErrors {
  siteName?: string
  siteDescription?: string
  contactEmail?: string
  maxQuestionsPerExam?: string
  defaultExamDuration?: string
  noticeContent?: string
}

export default function ConfigPage() {
  const [config, setConfig] = useState<SystemConfig>({ ...initialConfig })
  const [errors, setErrors] = useState<ConfigFormErrors>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // 更新字段
  const updateField = <K extends keyof SystemConfig>(
    field: K,
    value: SystemConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof ConfigFormErrors]) {
      setErrors((prev) => ({ ...prev, [field as keyof ConfigFormErrors]: undefined }))
    }
  }

  // 表单校验
  const validate = (): boolean => {
    const newErrors: ConfigFormErrors = {}
    if (!config.siteName.trim()) {
      newErrors.siteName = '请输入站点名称'
    }
    if (!config.siteDescription.trim()) {
      newErrors.siteDescription = '请输入站点描述'
    }
    if (!config.contactEmail.trim()) {
      newErrors.contactEmail = '请输入联系邮箱'
    } else if (!EMAIL_REGEX.test(config.contactEmail)) {
      newErrors.contactEmail = '邮箱格式不正确'
    }
    if (config.maxQuestionsPerExam <= 0) {
      newErrors.maxQuestionsPerExam = '最大题目数必须大于0'
    } else if (config.maxQuestionsPerExam > 500) {
      newErrors.maxQuestionsPerExam = '最大题目数不能超过500'
    }
    if (config.defaultExamDuration <= 0) {
      newErrors.defaultExamDuration = '考试时长必须大于0'
    } else if (config.defaultExamDuration > 300) {
      newErrors.defaultExamDuration = '考试时长不能超过300分钟'
    }
    if (config.enableNotice && !config.noticeContent.trim()) {
      newErrors.noticeContent = '启用公告后必须填写公告内容'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 保存配置
  const handleSave = () => {
    if (!validate()) return
    setConfirmOpen(true)
  }

  // 确认保存
  const handleConfirmSave = () => {
    setSaving(true)
    // 模拟保存请求
    setTimeout(() => {
      setSaving(false)
      setConfirmOpen(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }, 600)
  }

  return (
    <div className="animate-fade-in space-y-5">
      {/* 页面标题 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">系统设置</h1>
          <p className="mt-1 text-sm text-zinc-500">
            配置站点基本参数、考试规则与功能开关
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <Badge variant="success" dot className="animate-fade-in">
              <Check className="h-3 w-3" />
              保存成功
            </Badge>
          )}
          <Button
            variant="primary"
            icon={<Save className="h-4 w-4" />}
            onClick={handleSave}
            loading={saving}
          >
            保存配置
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* 基本设置 */}
        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <SettingsIcon className="h-4 w-4 text-primary-600" />
                基本设置
              </span>
            }
            subtitle="站点基础信息配置"
          />
          <CardBody className="space-y-4">
            <Input
              label="站点名称"
              placeholder="请输入站点名称"
              required
              value={config.siteName}
              onChange={(e) => updateField('siteName', e.target.value)}
              error={errors.siteName}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                站点描述
                <span className="ml-0.5 text-red-500">*</span>
              </label>
              <textarea
                className={cn(
                  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-800 transition-base',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/30',
                  'placeholder:text-zinc-400',
                  errors.siteDescription
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-zinc-300 focus:border-primary-500'
                )}
                rows={3}
                placeholder="请输入站点描述"
                value={config.siteDescription}
                onChange={(e) => updateField('siteDescription', e.target.value)}
              />
              {errors.siteDescription && (
                <p className="mt-1.5 text-xs text-red-500">{errors.siteDescription}</p>
              )}
            </div>
            <Input
              label="联系邮箱"
              placeholder="请输入联系邮箱"
              required
              type="email"
              value={config.contactEmail}
              onChange={(e) => updateField('contactEmail', e.target.value)}
              error={errors.contactEmail}
              prefix={<Mail className="h-4 w-4" />}
            />
          </CardBody>
        </Card>

        {/* 考试设置 */}
        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary-600" />
                考试设置
              </span>
            }
            subtitle="考试相关参数配置"
          />
          <CardBody className="space-y-4">
            <Input
              label="每场最大题目数"
              type="number"
              placeholder="请输入最大题目数"
              required
              value={config.maxQuestionsPerExam}
              onChange={(e) =>
                updateField('maxQuestionsPerExam', Number(e.target.value))
              }
              error={errors.maxQuestionsPerExam}
              hint="单场考试允许的题目数量上限，范围 1-500"
              suffix={<span className="text-xs text-zinc-400">道</span>}
            />
            <Input
              label="默认考试时长"
              type="number"
              placeholder="请输入默认考试时长"
              required
              value={config.defaultExamDuration}
              onChange={(e) =>
                updateField('defaultExamDuration', Number(e.target.value))
              }
              error={errors.defaultExamDuration}
              hint="新建考试时的默认时长，范围 1-300 分钟"
              suffix={<span className="text-xs text-zinc-400">分钟</span>}
            />
          </CardBody>
        </Card>

        {/* 功能开关 */}
        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary-600" />
                功能开关
              </span>
            }
            subtitle="控制系统功能模块的启停"
          />
          <CardBody className="space-y-5">
            <Toggle
              label="启用用户注册"
              description="开启后允许新用户自助注册账号，关闭后仅管理员可创建用户"
              checked={config.enableRegistration}
              onChange={(value) => updateField('enableRegistration', value)}
            />
            <div className="h-px bg-zinc-100" />
            <Toggle
              label="启用系统公告"
              description="开启后小程序端将展示公告内容，关闭后隐藏公告模块"
              checked={config.enableNotice}
              onChange={(value) => updateField('enableNotice', value)}
            />
          </CardBody>
        </Card>

        {/* 公告管理 */}
        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary-600" />
                公告管理
              </span>
            }
            subtitle="小程序端展示的系统公告内容"
            extra={
              <Badge variant={config.enableNotice ? 'success' : 'default'} dot>
                {config.enableNotice ? '已启用' : '已关闭'}
              </Badge>
            }
          />
          <CardBody>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                公告内容
                {config.enableNotice && <span className="ml-0.5 text-red-500">*</span>}
              </label>
              <textarea
                className={cn(
                  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-800 transition-base',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/30',
                  'placeholder:text-zinc-400',
                  'disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-60',
                  errors.noticeContent
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-zinc-300 focus:border-primary-500'
                )}
                rows={6}
                placeholder="请输入公告内容"
                value={config.noticeContent}
                onChange={(e) => updateField('noticeContent', e.target.value)}
                disabled={!config.enableNotice}
              />
              <div className="mt-1.5 flex items-center justify-between">
                {errors.noticeContent ? (
                  <p className="text-xs text-red-500">{errors.noticeContent}</p>
                ) : (
                  <p className="flex items-center gap-1 text-xs text-zinc-400">
                    <Bell className="h-3 w-3" />
                    公告将展示在小程序首页顶部
                  </p>
                )}
                <span className="text-xs text-zinc-400">
                  {config.noticeContent.length} / 500
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 配置概览提示 */}
      <Card>
        <CardBody>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-800">配置概览</div>
                <div className="mt-0.5 text-xs text-zinc-500">
                  站点「{config.siteName}」· 单场最多 {config.maxQuestionsPerExam} 题 ·
                  默认 {config.defaultExamDuration} 分钟 ·
                  注册{config.enableRegistration ? '已开启' : '已关闭'} ·
                  公告{config.enableNotice ? '已开启' : '已关闭'}
                </div>
              </div>
            </div>
            <Button
              variant="primary"
              icon={<Save className="h-4 w-4" />}
              onClick={handleSave}
              loading={saving}
            >
              保存配置
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* 保存确认对话框 */}
      <ConfirmDialog
        open={confirmOpen}
        title="保存系统配置"
        message="确定要保存当前系统配置吗？"
        description="保存后配置将立即生效，影响小程序端展示与功能。"
        confirmText="确认保存"
        loading={saving}
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
