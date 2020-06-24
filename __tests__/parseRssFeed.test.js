import fs from 'fs';
import path from 'path';
import parseRssFeed from '../src/parseRssFeed';

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFixture = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

describe('parseRssFeed tests', () => {
  test('parseRssFeed valid xml', () => {
    const expectedRssData = {
      channel: {
        title: 'Lorem ipsum feed for an interval of 1 minutes with 3 items',
        description: 'This is a constantly updating lorem ipsum feed',
      },
      posts: [
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
    };
    const rssXml = readFixture('validrss.xml');
    expect(parseRssFeed(rssXml)).toEqual(expectedRssData);
  });

  test('parseRssFeed invalid xml', () => {
    const rssXml = readFixture('invalidrss.xml');
    expect(() => parseRssFeed(rssXml)).toThrow('Invalid rss xml format');
  });
});
