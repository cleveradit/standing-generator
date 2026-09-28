import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the application shell without provider data', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Standing Generator' })).toBeInTheDocument();
  });
});
