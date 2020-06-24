import fs from 'fs';
import path from 'path';
import nock from 'nock';
import axios from 'axios';
import { saveRssChannel, saveNewPosts } from '../src/app';

axios.defaults.adapter = require('axios/lib/adapters/http');

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFixture = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');
const rssFeedUrl = 'http://lorem-rss.herokuapp.com/feed';
const proxyHost = 'https://cors-anywhere.herokuapp.com';
const vaildRssXml = readFixture('validrss.xml');
const invaildRssXml = readFixture('invalidrss.xml');
let state;

beforeEach(() => {
  state = {
    rssFeedForm: {
      state: 'initial',
      validationErrors: [],
    },
    rssChannels: [],
    rssPosts: [],
    currentLocale: 'ru',
  };
});

describe('"saveRssChannel" tests', () => {
  test('Testing "saveRssChannel" with valid xml', () => {
    const expectedState = {
      rssFeedForm: {
        state: 'initial',
        validationErrors: [],
      },
      rssChannels: [{
        title: 'Lorem ipsum feed for an interval of 1 minutes with 3 items',
        description: 'This is a constantly updating lorem ipsum feed',
        channelUrl: rssFeedUrl,
      }],
      rssPosts: [],
      currentLocale: 'ru',
    };

    nock(proxyHost)
      .get(`/${rssFeedUrl}`)
      .reply(200, vaildRssXml);

    return saveRssChannel(rssFeedUrl, state)
      .then(() => {
        expect(state).toEqual(expectedState);
      });
  });

  test('Testing "saveRssChannel" with invalid xml', () => {
    const expectedState = state;

    nock(proxyHost)
      .get(`/${rssFeedUrl}`)
      .reply(200, invaildRssXml);

    return saveRssChannel(rssFeedUrl, state)
      .catch(() => {})
      .then(() => {
        expect(state).toEqual(expectedState);
      });
  });

  test('Testing "saveRssChannel" with network error', () => {
    const expectedState = state;

    nock(proxyHost)
      .get(`/${rssFeedUrl}`)
      .reply(404);

    return saveRssChannel(rssFeedUrl, state)
      .catch(() => {})
      .then(() => {
        expect(state).toEqual(expectedState);
      });
  });
});

test('Testing "saveNewPosts"', () => {
  const expectedState = {
    rssFeedForm: {
      state: 'initial',
      validationErrors: [],
    },
    rssChannels: [{
      title: 'Lorem ipsum feed for an interval of 1 minutes with 3 items',
      description: 'This is a constantly updating lorem ipsum feed',
      channelUrl: rssFeedUrl,
    }],
    rssPosts: [
      {
        guid: 'http://example.com/test/1591780500',
        title: 'Lorem ipsum 2020-06-10T09:15:00Z',
        link: 'http://example.com/test/1591780500',
      },
      {
        guid: 'http://example.com/test/1591780440',
        title: 'Lorem ipsum 2020-06-10T09:14:00Z',
        link: 'http://example.com/test/1591780440',
      },
      {
        guid: 'http://example.com/test/1591780380',
        title: 'Lorem ipsum 2020-06-10T09:13:00Z',
        link: 'http://example.com/test/1591780380',
      },
    ],
    currentLocale: 'ru',
  };

  nock(proxyHost)
    .persist()
    .get(`/${rssFeedUrl}`)
    .reply(200, vaildRssXml);

  return saveRssChannel(rssFeedUrl, state)
    .then(() => {
      saveNewPosts(state);
    })
    .then(() => {
      expect(state).toEqual(expectedState);
    });
});
