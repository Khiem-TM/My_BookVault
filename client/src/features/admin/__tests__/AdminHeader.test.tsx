import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import AdminHeader from '../AdminHeader'

describe('AdminHeader', () => {
  it('renders tabs', () => {
    render(
      <MemoryRouter>
        <AdminHeader/>
      </MemoryRouter>
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Total Books')).toBeInTheDocument()
    expect(screen.getByText('Total Borrow')).toBeInTheDocument()
    expect(screen.getByText('Total User')).toBeInTheDocument()
    // expect(screen.getByText('Profile')).toBeInTheDocument()
  })
})
