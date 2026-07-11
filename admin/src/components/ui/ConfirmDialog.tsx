import { forwardRef, type ReactNode } from 'react'
import { Modal, type ModalSize } from './Modal'
import { Button, type ButtonVariant } from './Button'

export interface ConfirmDialogProps {
  open: boolean
  title?: ReactNode
  message?: ReactNode
  description?: ReactNode
  confirmText?: string
  cancelText?: string
  confirmVariant?: ButtonVariant
  cancelVariant?: ButtonVariant
  loading?: boolean
  size?: ModalSize
  onConfirm: () => void
  onCancel: () => void
  closeOnOverlay?: boolean
}

export const ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>(
  (
    {
      open,
      title = '确认操作',
      message,
      description,
      confirmText = '确定',
      cancelText = '取消',
      confirmVariant = 'primary',
      cancelVariant = 'outline',
      loading = false,
      size = 'sm',
      onConfirm,
      onCancel,
      closeOnOverlay = false,
    },
    ref
  ) => {
    return (
      <Modal
        open={open}
        onClose={onCancel}
        title={title}
        size={size}
        closeOnOverlay={closeOnOverlay && !loading}
        showCloseButton={false}
        footer={
          <>
            <Button
              variant={cancelVariant}
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              loading={loading}
            >
              {confirmText}
            </Button>
          </>
        }
      >
        <div ref={ref}>
          {message && (
            <div className="text-sm font-medium text-zinc-800">{message}</div>
          )}
          {description && (
            <div className="mt-1 text-sm text-zinc-500">{description}</div>
          )}
        </div>
      </Modal>
    )
  }
)

ConfirmDialog.displayName = 'ConfirmDialog'

export default ConfirmDialog
