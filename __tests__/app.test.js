import '@testing-library/jest-dom';
import { promises as fs } from 'fs';
import path from 'path';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import nock from 'nock';

import initApp from '../src/app/init.js';

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const elements = {};
const contents = {};
const proxyUrl = 'https://hexlet-allorigins.herokuapp.com';

beforeAll(async () => {
  contents.initialHtml = await fs.readFile(getFixturePath('index.html'), 'utf-8');
  contents.xmlContent = await fs.readFile(getFixturePath('rss.xml'), 'utf-8');
  contents.updatedXmlContent = await fs.readFile(getFixturePath('updated-rss.xml'), 'utf-8');
});

afterAll(() => {
  nock.cleanAll();
});

beforeEach(() => {
  document.body.innerHTML = contents.initialHtml;
  initApp(500);

  elements.submit = screen.getByRole('button');
  elements.input = screen.getByRole('textbox');
});

test('form is disabled while submitting', async () => {
  const url = 'https://example-rss.io/example';
  nock(proxyUrl).get('/get').query({ url, disableCache: true }).reply(200);

  userEvent.type(elements.input, url);
  expect(elements.submit).toBeEnabled();
  userEvent.click(elements.submit);
  expect(elements.input).toHaveAttribute('readonly');
  expect(elements.submit).toBeDisabled();

  await waitFor(() => {
    expect(elements.input).not.toHaveAttribute('readonly');
    expect(elements.submit).toBeEnabled();
  });
});

test('can add url, cannot add the same one again', async () => {
  const url = 'https://example2-rss.io';
  nock(proxyUrl).persist().get('/get').query({ url, disableCache: true })
    .reply(200, { contents: contents.xmlContent });

  userEvent.type(elements.input, url);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText('Example feed title')).toBeInTheDocument();
    expect(screen.getByText('Example feed description')).toBeInTheDocument();
    expect(screen.getByText('Example post title')).toBeInTheDocument();
    expect(screen.getByText('RSS успешно загружен')).toBeInTheDocument();
    expect(elements.submit).toBeEnabled();
  });

  userEvent.type(elements.input, url);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText('RSS уже существует')).toBeInTheDocument();
  });
});

test('validate invalid input url', async () => {
  userEvent.type(elements.input, ' ');
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText('Не должно быть пустым')).toBeInTheDocument();
  });

  userEvent.type(elements.input, 'ru.hexlet.io/lessons.rss');
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText('Ссылка должна быть валидным URL')).toBeInTheDocument();
  });
});

test('handle resource that does not contain valid rss', async () => {
  const url = 'https://example3-rss.io';
  nock(proxyUrl).get('/get').query({ url, disableCache: true }).reply(200, contents.initialHtml);

  userEvent.type(elements.input, url);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText('Ресурс не содержит валидный RSS')).toBeInTheDocument();
  });
});

test('update posts of existing feed', async () => {
  const url = 'https://example4-rss.io';
  nock(proxyUrl).get('/get').query({ url, disableCache: true })
    .reply(200, { contents: contents.xmlContent });
  nock(proxyUrl).persist().get('/get').query({ url, disableCache: true })
    .reply(200, { contents: contents.updatedXmlContent });

  userEvent.type(elements.input, url);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText('RSS успешно загружен')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('Example new post title')).toBeInTheDocument();
  });
});

test('show post info', async () => {
  const url = 'https://example5-rss.io';
  nock(proxyUrl).persist().get('/get').query({ url, disableCache: true })
    .reply(200, { contents: contents.xmlContent });

  userEvent.type(elements.input, url);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText('RSS успешно загружен')).toBeInTheDocument();
  });

  const readButton = screen.getByRole('button', { name: /просмотр/i });
  userEvent.click(readButton);

  await waitFor(() => {
    expect(screen.getByRole('dialog')).toHaveTextContent('Example post description');
  });
});

test('handle network error', async () => {
  const url = 'https://example6-rss.io';
  nock(proxyUrl).get('/get').query({ url, disableCache: true }).reply(404);

  userEvent.type(elements.input, url);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText('Ошибка сети')).toBeInTheDocument();
  });
});
