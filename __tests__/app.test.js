import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import initApp from '../src/app/init.js';

const pathToIndex = path.join(__dirname, '..', '__fixtures__', 'index.html');
const initialHtml = fs.readFileSync(pathToIndex, 'utf-8');
const elements = {};

beforeAll(() => {
});

beforeEach(() => {
  document.body.innerHTML = initialHtml;
  initApp();

  elements.submit = screen.getByRole('button');
  elements.input = screen.getByRole('textbox');
});

test('form is disabled while submitting', async () => {
  const name = 'https://ru.hexlet.io/lessons.rss';

  userEvent.type(elements.input, name);
  expect(elements.submit).not.toBeDisabled();
  userEvent.click(elements.submit);
  expect(elements.submit).toBeDisabled();

  await waitFor(() => {
    expect(elements.submit).not.toBeDisabled();
    expect(screen.getByRole('list')).toHaveTextContent(name);
  });
});

test('can add url', async () => {
  const name = 'https://ru.hexlet.io/lessons.rss';

  userEvent.type(elements.input, name);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByRole('listitem')).toHaveTextContent(name);
    expect(screen.getByText('RSS loaded successfully')).toBeInTheDocument();
  });
});

test('validate invalid input url', async () => {
  userEvent.type(elements.input, ' ');
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText('this is a required field')).toBeInTheDocument();
  });

  userEvent.type(elements.input, 'ru.hexlet.io/lessons.rss');
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText('this must be a valid URL')).toBeInTheDocument();
  });
});
