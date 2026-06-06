import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

const mockPush = vi.fn()
const mockLogin = vi.fn()

// Import after mocks are set up
const { default: LoginPage } = await import('@/app/login/page')

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email and password fields and submit button', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('renders link to register page', () => {
    render(<LoginPage />)
    expect(screen.getByRole('link', { name: /regístrate/i })).toBeInTheDocument()
  })

  it('shows error when submitted with empty fields', async () => {
    render(<LoginPage />)

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText(/completa todos los campos/i)).toBeInTheDocument()
    })
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('calls login with correct credentials on submit', async () => {
    mockLogin.mockResolvedValue(undefined)
    render(<LoginPage />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/email/i), 'juan@test.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'Password1')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'juan@test.com',
        password: 'Password1',
      })
    })
  })

  it('redirects to home on successful login', async () => {
    mockLogin.mockResolvedValue(undefined)
    render(<LoginPage />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/email/i), 'juan@test.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'Password1')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('shows error message on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Credenciales incorrectas'))
    render(<LoginPage />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/email/i), 'juan@test.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'WrongPass1')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument()
    })
    expect(mockPush).not.toHaveBeenCalled()
  })
})
