import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the landing page', () => {
  render(<BrowserRouter><App /></BrowserRouter>);
  const linkElement = screen.getByText(/Coindeed/i);
  expect(linkElement).toBeInTheDocument();
});
