import fs from 'fs';
import path from 'path';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import { screen, waitFor } from '@testing-library/dom';
import { toBeEnabled, toBeInTheDocument, toBeVisible } from '@testing-library/jest-dom/matchers';
import userEvent from '@testing-library/user-event';
import app from '../src/app';

debugger; // eslint-disable-line no-debugger

expect.extend({ toBeEnabled, toBeInTheDocument, toBeVisible });

axios.defaults.adapter = httpAdapter;

nock.disableNetConnect();

const getFixturePath = (filename) => path.join(__dirname, '__fixtures__', filename);
const getSourcePath = (filename) => path.join(__dirname, '..', 'src', filename);
const readFixture = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');
const readSource = (filename) => fs.readFileSync(getSourcePath(filename), 'utf-8');


const proxyHost = 'https://cors-anywhere.herokuapp.com';
const wrongUrl = 'http:/example.com/test1';
const rssFeed1Url = 'http://example.com/test1';
const rssFeed2Url = 'http://example.com/test2';
const rss11Xml = readFixture('rss1_1.xml');
const rss12Xml = readFixture('rss1_2.xml');
const rss2Xml = readFixture('rss2.xml');
let elements;
let rssPostTitles;

beforeEach(async () => {
  const initHtml = readSource('index.html');
  const parser = new DOMParser();
  const doc = parser.parseFromString(initHtml, 'text/html');
  document.body.innerHTML = doc.body.innerHTML;
  await app();
  elements = {
    input: screen.getByPlaceholderText('RSS link'),
    button: screen.getByRole('button', { name: 'Add' }),
    localeMenuButton: screen.getByRole('button', { name: 'en' }),
    ruLocaleLink: screen.getByRole('link', { name: 'ru' }),
  };
});

test('Wrong url test', async () => {
  const errorText = 'The field should contains valid URL';
  let validationFeedback = screen.queryByText(errorText);
  expect(validationFeedback).not.toBeInTheDocument();
  userEvent.type(elements.input, wrongUrl);
  await waitFor(() => {
    validationFeedback = screen.getByText(errorText);
    expect(validationFeedback).toBeInTheDocument();
  });
});

test('Empty url test', async () => {
  const errorText = 'The field should not be empty';
  let validationFeedback = screen.queryByText(errorText);
  expect(validationFeedback).not.toBeInTheDocument();
  userEvent.paste(elements.input, wrongUrl);
  userEvent.clear(elements.input);
  await waitFor(() => {
    validationFeedback = screen.getByText(errorText);
    expect(validationFeedback).toBeInTheDocument();
  });
});

test('Two rss feed test', async () => {
  nock(proxyHost)
    .get(`/${rssFeed1Url}`)
    .twice()
    .reply(200, rss11Xml);
  userEvent.paste(elements.input, rssFeed1Url);
  await waitFor(() => {
    expect(elements.button).toBeEnabled();
  });
  userEvent.click(elements.button);
  await waitFor(() => {
    rssPostTitles = screen.getAllByText(/^Post \d$/);
    expect(rssPostTitles.length).toEqual(3);
  });
  nock(proxyHost)
    .get(`/${rssFeed1Url}`)
    .twice()
    .reply(200, rss12Xml);
  await waitFor(() => {
    rssPostTitles = screen.getAllByText(/^Post \d$/);
    expect(rssPostTitles.length).toEqual(4);
  }, { timeout: 6000 });
  nock(proxyHost)
    .get(`/${rssFeed2Url}`)
    .twice()
    .reply(200, rss2Xml);
  userEvent.paste(elements.input, rssFeed2Url);
  await waitFor(() => {
    expect(elements.button).toBeEnabled();
  });
  userEvent.click(elements.button);
  await waitFor(() => {
    rssPostTitles = screen.getAllByText(/^Post \d$/);
    expect(rssPostTitles.length).toEqual(5);
  }, { timeout: 6000 });
}, 12000);

test('Locale change test', async () => {
  const appTitleText = 'RSS агрегатор';
  let appTitle = screen.queryByText(appTitleText);
  expect(appTitle).not.toBeInTheDocument();
  userEvent.click(elements.localeMenuButton);
  await waitFor(() => {
    expect(elements.ruLocaleLink).toBeVisible();
  });
  userEvent.click(elements.ruLocaleLink);
  await waitFor(() => {
    appTitle = screen.getByText(appTitleText);
    expect(appTitle).toBeInTheDocument();
  });
});
