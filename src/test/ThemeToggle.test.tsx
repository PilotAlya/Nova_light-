import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ThemeToggle from '../components/ThemeToggle';

describe('ThemeToggle', () => {
  it('renders sun icon in dark mode', () => {
    render(<ThemeToggle theme="dark" onToggle={vi.fn()} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
    expect(screen.getByLabelText('Включить светлую тему')).toBeInTheDocument();
  });

  it('renders moon icon in light mode', () => {
    render(<ThemeToggle theme="light" onToggle={vi.fn()} />);
    expect(screen.getByLabelText('Включить тёмную тему')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<ThemeToggle theme="dark" onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
