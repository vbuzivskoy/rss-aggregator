import fs from 'fs';
import path from 'path';
import parseRssFeed from '../src/parseRssFeed';

const getFixturePath = (filename) => path.join(__dirname, '__fixtures__', filename);
const readFixture = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

describe('parseRssFeed tests', () => {
  test('parseRssFeed valid xml', () => {
    const expectedRssData = {
      channel: {
        title: 'Valid rss xml format test',
        description: 'For valid rss xml format test',
      },
      posts: [
        {
          guid: 'http://example.com/test/1',
          title: 'Post 1',
          link: 'http://example.com/test/1',
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
