import axios from 'axios';
import i18next from 'i18next';
import * as yup from 'yup';
import once from 'lodash/once';
import differenceWith from 'lodash/differenceWith';
import parseRssFeed from './parseRssFeed';
import watchState from './watchers';
import en from './locales/en';
import ru from './locales/ru';

const getRssFeed = (rssFeedUrl) => {
  const proxyHost = 'cors-anywhere.herokuapp.com';
  const proxiedUrl = `https://${proxyHost}/${rssFeedUrl}`;
  return axios.get(proxiedUrl);
};
const saveNewPosts = (watchedState) => {
  const promises = watchedState.rssChannels.map(({ channelUrl }) => (
    getRssFeed(channelUrl)
      .then((response) => {
        const parsedRssFeedData = parseRssFeed(response.data);
        const newPosts = differenceWith(
          parsedRssFeedData.posts,
          watchedState.rssPosts,
          (postA, postB) => postA.guid === postB.guid,
        );
        watchedState.rssPosts = [ // eslint-disable-line no-param-reassign
          ...newPosts,
          ...watchedState.rssPosts,
        ];
      })
      .catch((error) => console.error(error))
  ));
  return Promise.all(promises);
};

const watchNewRssPosts = (watchedState) => {
  setTimeout(() => {
    saveNewPosts(watchedState)
      .finally(watchNewRssPosts(watchedState));
  }, 5000);
};

const saveRssChannel = (feedUrl, watchedState) => {
  watchedState.rssFeedFormState = 'processing'; // eslint-disable-line no-param-reassign
  return getRssFeed(feedUrl)
    .then((response) => parseRssFeed(response.data))
    .then((parsedRssFeedData) => {
      watchedState.rssFeedFormState = 'initial'; // eslint-disable-line no-param-reassign
      watchedState.rssChannels = [ // eslint-disable-line no-param-reassign
        { ...parsedRssFeedData.channel, channelUrl: feedUrl },
        ...watchedState.rssChannels,
      ];
    })
    .catch((error) => {
      watchedState.rssFeedFormState = 'processingFailed'; // eslint-disable-line no-param-reassign
      // eslint-disable-next-line no-param-reassign
      watchedState.validationErrors = error.request instanceof XMLHttpRequest ? ['networkError'] : ['parserError'];
      throw error;
    });
};

const validateRssUrl = (feedUrl, watchedState) => {
  const formValidationSchema = yup.object().shape({
    feedUrl: yup.string()
      .url('notURL')
      .required('notEmpty')
      .notOneOf(watchedState.rssChannels.map(({ channelUrl }) => channelUrl), 'notUniq'),
  });
  return formValidationSchema.validate(
    { feedUrl },
  );
};

const app = () => {
  const state = {
    rssFeedFormState: 'initial',
    validationErrors: [],
    rssChannels: [],
    rssPosts: [],
    currentLocale: 'en',
  };

  const oncedWatchNewRssPosts = once(watchNewRssPosts);

  return i18next.init({
    lng: state.currentLocale,
    resources: {
      en,
      ru,
    },
  })
    .then(() => watchState(state))
    .then((watchedState) => {
      const rssFeedForm = document.querySelector('#rssFeedForm');
      const localeDropdownMenu = document.querySelector('#localeDropdownMenu');

      rssFeedForm.addEventListener('input', (event) => {
        const formData = new FormData(event.currentTarget);
        const feedUrl = formData.get('feedUrl');
        validateRssUrl(feedUrl, watchedState)
          .then(() => {
            watchedState.rssFeedFormState = 'filling'; // eslint-disable-line no-param-reassign
            watchedState.validationErrors = []; // eslint-disable-line no-param-reassign
          })
          .catch(({ errors }) => {
            watchedState.rssFeedFormState = 'fillingWithErrors'; // eslint-disable-line no-param-reassign
            // eslint-disable-next-line no-param-reassign
            watchedState.validationErrors = errors;
          });
      });

      rssFeedForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const feedUrl = formData.get('feedUrl');
        saveRssChannel(feedUrl, watchedState)
          .then(() => saveNewPosts(watchedState))
          .then(() => oncedWatchNewRssPosts(watchedState));
      });

      localeDropdownMenu.addEventListener('click', (event) => {
        event.preventDefault();
        // eslint-disable-next-line no-param-reassign
        watchedState.currentLocale = event.target.textContent;
      });
    });
};

export default app;
