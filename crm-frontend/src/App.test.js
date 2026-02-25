import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => element || null,
  Navigate: () => null,
  Outlet: () => null,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', state: null }),
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
  Toaster: () => null,
}));

jest.mock('./pages/LoginPage', () => () => <div>Login</div>);
jest.mock('./pages/SignupPage', () => () => <div>Signup</div>);
jest.mock('./pages/DashboardPage', () => () => <div>Dashboard</div>);
jest.mock('./pages/ContactsPage', () => () => <div>Contacts</div>);
jest.mock('./pages/ActivitiesPage', () => () => <div>Activities</div>);
jest.mock('./components/auth/ProtectedRoute', () => () => null);
jest.mock('./components/layout/Layout', () => () => null);
jest.mock('./components/common/LoadingSpinner', () => () => null);
jest.mock('./store/authStore', () => () => ({
  initialize: jest.fn(),
  isLoading: false,
}));

import App from './App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(true).toBe(true);
  });
});