import axios from 'axios';
import i18next from 'i18next';
import * as yup from 'yup';
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
export const saveNewPosts = (ws) => {
  const watchedState = ws;
  const promises = watchedState.rssChannels.map(({ channelUrl }) => (
    getRssFeed(channelUrl)
      .then((response) => {
        const parsedRssFeedData = parseRssFeed(response.data);
        const newPosts = differenceWith(
          parsedRssFeedData.posts,
          watchedState.rssPosts,
          (A, B) => A.guid === B.guid,
        );
        watchedState.rssPosts = [
          ...newPosts,
          ...watchedState.rssPosts,
        ];
      })
      .catch((error) => console.error(error))
  ));
  return Promise.all(promises);
};

const watchNewRssPosts = (ws) => {
  setTimeout(() => {
    saveNewPosts(ws)
      .then(() => watchNewRssPosts(ws));
  }, 5000);
};

export const saveRssChannel = (feedUrl, ws) => {
  const watchedState = ws;
  return getRssFeed(feedUrl)
    .then((response) => parseRssFeed(response.data))
    .then((parsedRssFeedData) => {
      watchedState.rssFeedForm.state = 'initial';
      watchedState.rssChannels = [
        { ...parsedRssFeedData.channel, channelUrl: feedUrl },
        ...watchedState.rssChannels,
      ];
    })
    .catch((error) => {
      watchedState.rssFeedForm.state = 'processingFailed';
      watchedState.rssFeedForm.validationErrors = error.request instanceof XMLHttpRequest ? ['networkError'] : ['parserError'];
      throw error;
    });
};

const app = () => {
  const state = {
    rssFeedForm: {
      state: 'initial', // initial, filling, fillingWithErrors, processing, processingFailed
      validationErrors: [],
    },
    rssChannels: [],
    rssPosts: [],
    currentLocale: 'ru',
  };

  i18next.init({
    lng: state.currentLocale,
    resources: {
      en,
      ru,
    },
  })
    .then(() => watchState(state))
    .then((ws) => {
      const watchedState = ws;
      const rssFeedForm = document.querySelector('#rssFeedForm');
      const localeDropdownMenu = document.querySelector('#localeDropdownMenu');

      const formValidationSchema = yup.object().shape({
        feedUrl: yup.string()
          .url('notURL')
          .required('notEmpty')
          .test(
            'uniq',
            'notUniq',
            function test(value) {
              return !this.options.context.includes(value);
            },
          ),
      });

      rssFeedForm.addEventListener('input', (event) => {
        const formData = new FormData(event.currentTarget);
        const feedUrl = formData.get('feedUrl');
        formValidationSchema.validate(
          { feedUrl },
          { context: state.rssChannels.map(({ channelUrl }) => channelUrl) },
        )
          .then(() => {
            watchedState.rssFeedForm.state = 'filling';
            watchedState.rssFeedForm.validationErrors = [];
          })
          .catch(({ errors }) => {
            watchedState.rssFeedForm.state = 'fillingWithErrors';
            watchedState.rssFeedForm.validationErrors = errors;
          });
      });

      rssFeedForm.addEventListener('submit', (event) => {
        event.preventDefault();
        watchedState.rssFeedForm.state = 'processing';
        const formData = new FormData(event.target);
        const feedUrl = formData.get('feedUrl');
        saveRssChannel(feedUrl, watchedState)
          .then(() => saveNewPosts(watchedState))
          .then(() => watchNewRssPosts(watchedState));
      });

      localeDropdownMenu.addEventListener('click', (event) => {
        event.preventDefault();
        watchedState.currentLocale = event.target.textContent;
      });
    });
};

export default app;
