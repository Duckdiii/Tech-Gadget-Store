import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pagination from './Pagination'

describe('Pagination (variant icon)', () => {
  it('disable nút trang trước khi đang ở trang đầu', () => {
    render(<Pagination page={0} totalPages={5} onPageChange={() => {}} />)
    expect(screen.getByLabelText('Trang trước')).toBeDisabled()
    expect(screen.getByLabelText('Trang sau')).not.toBeDisabled()
  })

  it('disable nút trang sau khi đang ở trang cuối', () => {
    render(<Pagination page={4} totalPages={5} onPageChange={() => {}} />)
    expect(screen.getByLabelText('Trang sau')).toBeDisabled()
    expect(screen.getByLabelText('Trang trước')).not.toBeDisabled()
  })

  it('gọi onPageChange với số trang đúng khi click nút trang sau', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={1} totalPages={5} onPageChange={onPageChange} />)

    await user.click(screen.getByLabelText('Trang sau'))

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('gọi onPageChange với số trang đúng khi click nút số trang', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={0} totalPages={5} onPageChange={onPageChange} />)

    await user.click(screen.getByText('3'))

    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})

describe('Pagination (variant text)', () => {
  it('gọi onPageChange với số trang đúng khi click nút trang trước', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} variant="text" />)

    await user.click(screen.getByText('‹'))

    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('disable nút trang trước ở trang đầu', () => {
    render(<Pagination page={0} totalPages={5} onPageChange={() => {}} variant="text" />)
    expect(screen.getByText('‹')).toBeDisabled()
  })
})
