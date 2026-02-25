import { render, screen } from '@testing-library/react';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => element || null,
  Navigate: () => null,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', state: null }),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
  Toaster: () => null,
}));

// Mock hooks
jest.mock('./hooks/useAuth', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    signup: jest.fn(),
    signin: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock pages
jest.mock('./pages/SignInPage', () => () => <div data-testid="signin-page">SignIn Page</div>);
jest.mock('./pages/SignUpPage', () => () => <div data-testid="signup-page">SignUp Page</div>);
jest.mock('./pages/DashboardPage', () => () => <div data-testid="dashboard-page">Dashboard</div>);
jest.mock('./components/shared/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }) => children,
  PublicRoute: ({ children }) => children,
}));

import App from './App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
  });
});