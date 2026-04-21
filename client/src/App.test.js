import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Ryde application', () => {
  render(<App />);
  const logoElement = screen.getByRole('link', { name: /Ryde/i });
  expect(logoElement).toBeInTheDocument();
});