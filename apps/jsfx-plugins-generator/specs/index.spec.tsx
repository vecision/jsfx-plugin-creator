import { act, render } from '@testing-library/react';
import React from 'react';

import Page from '../src/app/page';

describe('Index', () => {
  it('should render successfully', async () => {
    const { baseElement } = await act(async () => render(<Page />));
    expect(baseElement).toBeTruthy();
  });
});
