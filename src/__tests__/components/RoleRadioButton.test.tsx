import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoleRadioButton from '@/src/components/RoleRadioButton';

describe('RoleRadioButton', () => {
  it('renders both radio buttons', () => {
    render(<RoleRadioButton />);

    expect(screen.getByLabelText('Member')).toBeInTheDocument();
    expect(screen.getByLabelText('Admin')).toBeInTheDocument();
  });

  it('selects "Member" by default', () => {
    render(<RoleRadioButton />);

    const memberRadio = screen.getByLabelText('Member') as HTMLInputElement;
    const adminRadio = screen.getByLabelText('Admin') as HTMLInputElement;

    expect(memberRadio.checked).toBe(true);
    expect(adminRadio.checked).toBe(false);
  });

  it('changes selection when clicking on a radio button', () => {
    render(<RoleRadioButton />);

    const memberRadio = screen.getByLabelText('Member') as HTMLInputElement;
    const adminRadio = screen.getByLabelText('Admin') as HTMLInputElement;

    fireEvent.click(adminRadio);

    expect(memberRadio.checked).toBe(false);
    expect(adminRadio.checked).toBe(true);
  });
});
