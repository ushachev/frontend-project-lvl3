import '@testing-library/jest-dom';
import { promises as fs } from 'fs';
import path from 'path';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import nock from 'nock';

import initApp from '../src/app/init.js';

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const elements = {};
const proxyUrl = 'https://hexlet-allorigins.herokuapp.com';

let initialHtml;
let xmlContent;

beforeAll(async () => {
  initialHtml = await fs.readFile(getFixturePath('index.html'), 'utf-8');
  xmlContent = await fs.readFile(getFixturePath('rss.xml'), 'utf-8');
});

beforeEach(() => {
  document.body.innerHTML = initialHtml;
  initApp();

  elements.submit = screen.getByRole('button');
  elements.input = screen.getByRole('textbox');
});

test('form is disabled while submitting', async () => {
  const url = 'https://example-rss.io/example';
  nock(proxyUrl).get('/raw').query({ url }).reply(200);

  userEvent.type(elements.input, url);
  expect(elements.submit).not.toBeDisabled();
  userEvent.click(elements.submit);
  expect(elements.submit).toBeDisabled();

  await waitFor(() => {
    expect(elements.submit).not.toBeDisabled();
  });
});

test('can add url, cannot add the same one again', async () => {
  const url = 'https://example-rss.io';
  nock(proxyUrl).get('/raw').query({ url }).reply(200, xmlContent);

  userEvent.type(elements.input, url);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText('Example feed title')).toBeInTheDocument();
    expect(screen.getByText('Example feed description')).toBeInTheDocument();
    expect(screen.getByText('Example post title')).toBeInTheDocument();
    expect(screen.getByText('RSS loaded successfully')).toBeInTheDocument();
    expect(elements.submit).not.toBeDisabled();
  });

  userEvent.type(elements.input, url);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText('RSS already exists')).toBeInTheDocument();
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

test('handle resource that does not contain valid rss', async () => {
  const url = 'https://example-rss.io';
  nock(proxyUrl).get('/raw').query({ url }).reply(200, initialHtml);

  userEvent.type(elements.input, url);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText('Resource does not contain valid RSS')).toBeInTheDocument();
  });
});
