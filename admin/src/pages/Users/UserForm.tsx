import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Select } from '@/components/ui'
import type { SelectOption } from '@/components/ui'
import type { User } from '@/types'

export interface UserFormValues {
  nickName: string
  status: User['status']
}

export interface UserFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: UserFormValues) => void
  user?: User | null
  loading?: boolean
}

const statusOptions: SelectOption[] = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'disabled' },
  { label: '封禁', value: 'banned' },
]

export default function UserForm({
  open,
  onClose,
  onSubmit,
  user,
  loading = false,
}: UserFormProps) {
  const [nickName, setNickName] = useState('')
  const [status, setStatus] = useState<User['status']>('active')
  const [errors, setErrors] = useState<{ nickName?: string }>({})

  useEffect(() => {
    if (open) {
      setNickName(user?.nickName ?? '')
      setStatus(user?.status ?? 'active')
      setErrors({})
    }
  }, [open, user])

  const validate = (): boolean => {
    const nextErrors: { nickName?: string } = {}
    const trimmed = nickName.trim()
    if (!trimmed) {
      nextErrors.nickName = '请输入昵称'
    } else if (trimmed.length > 20) {
      nextErrors.nickName = '昵称不能超过20个字符'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({ nickName: nickName.trim(), status })
  }

  const isEdit = !!user

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '编辑用户' : '新增用户'}
      subtitle={isEdit ? `修改用户「${user?.nickName}」的信息` : '填写新用户信息'}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="昵称"
          required
          placeholder="请输入用户昵称"
          value={nickName}
          onChange={(e) => setNickName(e.target.value)}
          error={errors.nickName}
          maxLength={20}
        />
        <Select
          label="状态"
          required
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value as User['status'])}
          hint="启用：用户可正常使用；禁用：临时停用；封禁：永久禁止登录"
        />
      </div>
    </Modal>
  )
}
