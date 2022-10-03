import React from 'react';
import { render, screen } from '@testing-library/react';
import Tooltip from '.';

describe('Tooltip component', () => {
  it('should render the component', () => {
    render(
      <Tooltip title="Center" arrow={true} centerAlign={true}>
        <span>Hover over me!</span>
      </Tooltip>,
    );
    const component = screen.queryByTestId('tooltip-component');
    expect(component).toBeInTheDocument();
  });
});
