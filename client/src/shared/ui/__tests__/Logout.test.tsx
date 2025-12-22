import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '../Header'
import AdminHeader from '../../../features/admin/AdminHeader'

beforeEach(() => {
  const store: Record<string,string> = {}
  // @ts-ignore
  globalThis.localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { for (const k of Object.keys(store)) delete store[k] }
  }
  localStorage.setItem('token', 't')
  localStorage.setItem('role', 'USER')
})

describe('Logout', () => {
  it('clears token and role in user header', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Header/>
      </MemoryRouter>
    )
    const userButton = screen.getByTitle('User Actions')
    await user.click(userButton)
    await user.click(screen.getByText('Log Out'))
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('role')).toBeNull()
    })
  })

  it('clears token and role in admin header', async () => {
    localStorage.setItem('role', 'ADMIN')
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminHeader/>
      </MemoryRouter>
    )
    await user.click(screen.getByText('Logout'))
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('role')).toBeNull()
    })
  })
})
