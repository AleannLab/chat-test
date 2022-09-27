import React from 'react';
import { render, screen } from '@testing-library/react';
import Loader from '.';

describe('Loader component', () => {
  it('should not show loader', () => {
    render(<Loader show={false} />);
    expect(screen.queryByAltText(/loader/)).not.toBeInTheDocument();
  });

  it('should show loader', () => {
    render(<Loader show />);
    expect(screen.getByAltText(/loader/)).toBeInTheDocument();
  });

  it('should not show message', () => {
    render(<Loader showMessage={false} />);
    expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
  });

  it('should show loading message', () => {
    render(<Loader />);
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });
});
