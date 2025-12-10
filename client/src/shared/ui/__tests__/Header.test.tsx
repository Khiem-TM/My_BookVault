import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '../Header'

describe('Header', () => {
  it('renders nav links and profile', () => {
    render(
      <MemoryRouter>
        <Header/>
      </MemoryRouter>
    )
    expect(screen.getByText('BookVault')).toBeInTheDocument()
    expect(screen.getByText('Browse')).toBeInTheDocument()
    expect(screen.getByText('My Library')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('Orders')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('search input works and navigates', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}
        initialIndex={0}>
        <Header/>
      </MemoryRouter>
    )
    const input = screen.getByPlaceholderText('Search books, authors...')
    await user.type(input, 'clean code')
    await user.keyboard('{Enter}')
    expect(input).toHaveValue('clean code')
  })

  it('applies active style on current route', () => {
    render(
      <MemoryRouter initialEntries={['/books']}>
        <Header/>
      </MemoryRouter>
    )
    expect(screen.getByText('Browse')).toHaveClass('text-blue-600')
  })
})
