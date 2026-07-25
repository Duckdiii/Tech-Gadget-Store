import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('render children', () => {
    render(<Button>Lưu</Button>)
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
  })

  it('gọi onClick khi click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Lưu</Button>)

    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('không gọi onClick khi disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick} disabled>Lưu</Button>)

    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    expect(onClick).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeDisabled()
  })

  it('áp class theo variant', () => {
    render(<Button variant="danger">Xoá</Button>)
    expect(screen.getByRole('button', { name: 'Xoá' })).toHaveClass('bg-red-600')
  })

  it('mặc định dùng variant primary khi không truyền variant', () => {
    render(<Button>Lưu</Button>)
    expect(screen.getByRole('button', { name: 'Lưu' })).toHaveClass('bg-[#E8420A]')
  })
})
