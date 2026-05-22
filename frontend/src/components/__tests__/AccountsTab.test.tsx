import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import AccountsTab from '../AccountsTab';
import { Currency } from '../../types';

// Mock framer-motion to prevent SVG/Animation observer errors in jsdom
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, onClick }: any) => (
      <div className={className} onClick={onClick}>{children}</div>
    )
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('AccountsTab', () => {
  const mockAccounts = [
    { 
      fa_id: 1, 
      user_id: 1, 
      fa_name: 'Main Card', 
      balance: 5000, 
      currency: Currency.UAH, 
      is_active: true, 
      fa_created_at: '2026-05-22T00:00:00Z' 
    }
  ];

  const mockOnAddAccount = vi.fn();
  const mockOnUpdateStatus = vi.fn();
  const mockOnUpdateBalance = vi.fn();

  it('renders accounts correctly', () => {
    render(
      <AccountsTab 
        accounts={mockAccounts}
        onAddAccount={mockOnAddAccount}
        onUpdateStatus={mockOnUpdateStatus}
        onUpdateBalance={mockOnUpdateBalance}
      />
    );
    
    expect(screen.getByText('Main Card')).toBeInTheDocument();
    expect(screen.getByText('Живий')).toBeInTheDocument();
    expect(screen.getByText(/5\s*000/)).toBeInTheDocument();
  });

  it('opens add account modal when clicking the button', () => {
    render(
      <AccountsTab 
        accounts={mockAccounts}
        onAddAccount={mockOnAddAccount}
        onUpdateStatus={mockOnUpdateStatus}
        onUpdateBalance={mockOnUpdateBalance}
      />
    );
    
    const addButton = screen.getByText('Створити рахунок');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Створити Новий Рахунок')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Приклад: Приват Картка, Готівка USD')).toBeInTheDocument();
  });
});
