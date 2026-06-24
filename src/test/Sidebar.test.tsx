import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from '../components/Sidebar';

const defaultProps = {
  activeTab: 'kanban',
  setActiveTab: vi.fn(),
  pinnedSections: [] as string[],
  onTogglePin: vi.fn(),
  accentColor: '#818cf8',
  notificationCounts: {} as Record<string, number>,
  userRole: 'admin',
};

describe('Sidebar', () => {
  it('renders all nav items for admin', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getAllByText('Пайплайн задач').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Аналитика').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Security').length).toBeGreaterThan(0);
  });

  it('renders limited items for designer role', () => {
    render(<Sidebar {...defaultProps} userRole="designer" />);
    expect(screen.getAllByText('Пайплайн задач').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Аналитика').length).toBe(0);
    expect(screen.queryAllByText('Security').length).toBe(0);
  });

  it('highlights active tab', () => {
    render(<Sidebar {...defaultProps} activeTab="analytics" />);
    const analyticsBtns = screen.getAllByText('Аналитика');
    const hasActive = analyticsBtns.some(btn => btn.closest('button')?.getAttribute('aria-current') === 'page');
    expect(hasActive).toBe(true);
  });

  it('calls setActiveTab on click', () => {
    const setActiveTab = vi.fn();
    render(<Sidebar {...defaultProps} setActiveTab={setActiveTab} />);
    fireEvent.click(screen.getAllByText('Аналитика')[0]);
    expect(setActiveTab).toHaveBeenCalledWith('analytics');
  });
});
