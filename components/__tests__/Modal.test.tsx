// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import Modal from '../Modal';

describe('Modal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  afterEach(() => {
    cleanup();
  });

  it('renders nothing when open=false', () => {
    const { queryByRole } = render(
      <Modal open={false} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    );
    expect(queryByRole('dialog')).toBeNull();
  });

  it('renders children when open=true', () => {
    const { getByText } = render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Hello World</p>
      </Modal>,
    );
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('sets role=dialog and aria-label', () => {
    const { getByRole } = render(
      <Modal open={true} onClose={onClose} title="My Dialog">
        <p>Content</p>
      </Modal>,
    );
    const dialog = getByRole('dialog');
    expect(dialog.getAttribute('aria-label')).toBe('My Dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('calls onClose on Escape', () => {
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    );
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on overlay click', () => {
    const { container } = render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    );
    // The overlay is the outermost fixed div
    const overlay = container.querySelector('.fixed')!;
    // Simulate click where target === the overlay itself
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on content click', () => {
    const { getByText } = render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Inner Content</p>
      </Modal>,
    );
    fireEvent.click(getByText('Inner Content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('locks body scroll when open', () => {
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');
  });
});
