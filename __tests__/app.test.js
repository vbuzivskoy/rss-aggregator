import fs from 'fs';
import path from 'path';
import nock from 'nock';
import axios from 'axios';
import { waitFor, getByPlaceholderText, getByText } from '@testing-library/dom';
import { toBeInTheDocument, toBeEnabled } from '@testing-library/jest-dom/matchers';
import userEvent from '@testing-library/user-event';
import prettier from 'prettier';
import app from '../src/app';

debugger; // eslint-disable-line no-debugger

expect.extend({ toBeInTheDocument, toBeEnabled });

axios.defaults.adapter = require('axios/lib/adapters/http');

nock.disableNetConnect();

const getFixturePath = (filename) => path.join(__dirname, '__fixtures__', filename);
const getSourcePath = (filename) => path.join(__dirname, '..', 'src', filename);
const readFixture = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');
const copyFixture = (filename) => (
  fs.copyFileSync(getSourcePath(filename), getFixturePath(filename))
);
const removeFixture = (filename) => (
  fs.unlinkSync(getFixturePath(filename))
);

const prettierOptions = {
  parser: 'html',
  htmlWhitespaceSensitivity: 'ignore',
  tabWidth: 4,
};
const getTree = () => prettier.format(document.body.innerHTML, prettierOptions);

const proxyHost = 'https://cors-anywhere.herokuapp.com';
const wrongUrl = 'htp://lorem-rss.herokuapp.com/feed';
const rssFeedUrl1sec = 'http://lorem-rss.herokuapp.com/feed?length=5&unit=second&interval=1';
const rssFeedUrl2sec = 'http://lorem-rss.herokuapp.com/feed?length=5&unit=second&interval=2';
const rssXml1sec1 = readFixture('rss1sec1.xml');
const rssXml2sec1 = readFixture('rss2sec1.xml');
const rssXml2sec2 = readFixture('rss2sec2.xml');
let elements;

beforeAll(() => copyFixture('index.html'));
afterAll(() => removeFixture('index.html'));

beforeEach(() => {
  const initHtml = readFixture('index.html');
  document.documentElement.innerHTML = initHtml;
  return app()
    .then(() => {
      elements = {
        input: getByPlaceholderText(document.body, 'RSS link'),
        button: getByText(document.body, 'Add'),
      };
    });
});

test('Wrong url test', () => {
  userEvent.paste(elements.input, wrongUrl);
  return waitFor(() => {
    const validationFeedback = getByText(document.body, 'The field should contains valid URL');
    expect(validationFeedback).toBeInTheDocument();
  });
});

test('Empty url test', () => {
  userEvent.paste(elements.input, wrongUrl);
  return waitFor(() => {
    const validationFeedback = getByText(document.body, 'The field should contains valid URL');
    expect(validationFeedback).toBeInTheDocument();
    userEvent.clear(elements.input);
  })
    .then(() => (
      waitFor(() => {
        const validationFeedback = getByText(document.body, 'The field should not be empty');
        expect(validationFeedback).toBeInTheDocument();
      })
    ));
});

test('One rss feed test', () => {
  expect(getTree()).toMatchSnapshot();
  nock(proxyHost)
    .get(`/${rssFeedUrl2sec}`)
    .twice()
    .reply(200, rssXml2sec1);

  userEvent.paste(elements.input, rssFeedUrl2sec);
  return waitFor(() => {
    expect(elements.button).toBeEnabled();
  })
    .then(() => {
      userEvent.click(elements.button);
    })
    .then(() => waitFor(() => {
      const text = getByText(document.body, 'Lorem ipsum 2020-07-02T10:46:16Z');
      expect(text).toBeInTheDocument();
      expect(getTree()).toMatchSnapshot();
    }))
    .then(() => {
      nock(proxyHost)
        .get(`/${rssFeedUrl2sec}`)
        .once()
        .reply(200, rssXml2sec2);
    })
    .then(() => waitFor(() => {
      const text = getByText(document.body, 'Lorem ipsum 2020-07-02T10:46:20Z');
      expect(text).toBeInTheDocument();
      expect(getTree()).toMatchSnapshot();
    }, { timeout: 6000 }));
}, 10000);

test('Two rss feed test', () => {
  expect(getTree()).toMatchSnapshot();
  nock(proxyHost)
    .get(`/${rssFeedUrl2sec}`)
    .twice()
    .reply(200, rssXml2sec1);

  userEvent.paste(elements.input, rssFeedUrl2sec);
  return waitFor(() => {
    expect(elements.button).toBeEnabled();
  })
    .then(() => {
      userEvent.click(elements.button);
    })
    .then(() => waitFor(() => {
      const text = getByText(document.body, 'Lorem ipsum 2020-07-02T10:46:16Z');
      expect(text).toBeInTheDocument();
      expect(getTree()).toMatchSnapshot();
    }))
    .then(() => {
      nock(proxyHost)
        .get(`/${rssFeedUrl2sec}`)
        .twice()
        .reply(200, rssXml2sec2);
    })
    .then(() => waitFor(() => {
      const text = getByText(document.body, 'Lorem ipsum 2020-07-02T10:46:20Z');
      expect(text).toBeInTheDocument();
      expect(getTree()).toMatchSnapshot();
    }, { timeout: 6000 }))
    .then(() => {
      nock(proxyHost)
        .get(`/${rssFeedUrl1sec}`)
        .twice()
        .reply(200, rssXml1sec1);
    })
    .then(() => {
      userEvent.paste(elements.input, rssFeedUrl1sec);
    })
    .then(() => waitFor(() => {
      expect(elements.button).toBeEnabled();
    }))
    .then(() => {
      userEvent.click(elements.button);
    })
    .then(() => waitFor(() => {
      const text = getByText(document.body, 'Lorem ipsum 2020-07-02T10:46:21Z');
      expect(text).toBeInTheDocument();
      expect(getTree()).toMatchSnapshot();
    }, { timeout: 6000 }));
}, 13000);
