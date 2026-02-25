import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContactModal from './ContactModal';

describe('ContactModal Component', () => {
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnClose.mockClear();
  });

  const renderModal = (contact = null) => render(
    <ContactModal contact={contact} onSave={mockOnSave} onClose={mockOnClose} />
  );

  it('renders Add Contact modal when no contact provided', () => {
    renderModal();
    expect(screen.getByText('Add Contact')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders Edit Contact modal when contact provided', () => {
    renderModal({ _id: '1', name: 'Test User', email: 'test@test.com', status: 'Lead' });
    expect(screen.getByText('Edit Contact')).toBeInTheDocument();
  });

  it('prefills form fields when editing', () => {
    renderModal({ _id: '1', name: 'John Doe', email: 'john@test.com', phone: '1234567890', company: 'Acme', status: 'Prospect', notes: 'Test note' });
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@test.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Acme')).toBeInTheDocument();
  });

  it('calls onClose when cancel button clicked', () => {
    renderModal();
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close X button clicked', () => {
    renderModal();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows validation error when name is empty', async () => {
    renderModal();
    await act(async () => { fireEvent.click(screen.getByText(/Create Contact/i)); });
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when email is empty', async () => {
    renderModal();
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'Jane Doe' } });
      fireEvent.click(screen.getByText(/Create Contact/i));
    });
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    renderModal();
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'Jane Doe' } });
      // 'notanemail' has no @ so it fails the regex → shows "Invalid email address"
      fireEvent.change(screen.getByPlaceholderText('email@company.com'), { target: { value: 'notanemail' } });
      fireEvent.click(screen.getByText(/Create Contact/i));
    });
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('calls onSave with correct data on valid submit', async () => {
    mockOnSave.mockResolvedValueOnce({});
    renderModal();
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'Jane Doe' } });
      fireEvent.change(screen.getByPlaceholderText('email@company.com'), { target: { value: 'jane@test.com' } });
      fireEvent.click(screen.getByText(/Create Contact/i));
    });
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Jane Doe', email: 'jane@test.com', status: 'Lead' }),
        undefined
      );
    });
  });

  it('calls onSave with contact id when editing', async () => {
    mockOnSave.mockResolvedValueOnce({});
    renderModal({ _id: 'abc123', name: 'Old Name', email: 'old@test.com', status: 'Lead' });
    await act(async () => {
      fireEvent.change(screen.getByDisplayValue('Old Name'), { target: { value: 'New Name' } });
      fireEvent.click(screen.getByText(/Save Changes/i));
    });
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Name' }),
        'abc123'
      );
    });
  });

  it('renders all three status options', () => {
    renderModal();
    expect(screen.getByText('Lead')).toBeInTheDocument();
    expect(screen.getByText('Prospect')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
  });
});