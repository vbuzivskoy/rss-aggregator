import axios from 'axios';
import i18next from 'i18next';
import * as yup from 'yup';
import differenceWith from 'lodash/differenceWith';
import some from 'lodash/some';
import parseRssFeed from './parseRssFeed';
import watchState from './watchers';
import en from './locales/en';
import ru from './locales/ru';

const corsProxyInit = () => {
  const corsAPIhost = 'cors-anywhere.herokuapp.com';
  const corsAPIurl = `https://${corsAPIhost}/`;
  const sliceArray = [].slice;
  const origin = `${window.location.protocol}//${window.location.host}`;
  const originOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function open(...argums) {
    const args = sliceArray.call(argums);
    const targetOrigin = /^https?:\/\/([^/]+)/i.exec(args[1]);
    if (targetOrigin && targetOrigin[0].toLowerCase() !== origin
      && targetOrigin[1] !== corsAPIhost) {
      args[1] = corsAPIurl + args[1];
    }
    return originOpen.apply(this, args);
  };
};

const getRssFeed = (url) => {
  corsProxyInit();

  return axios.get(url);
};

const watchNewPosts = (ws) => {
  const watchedState = ws;
  setTimeout(() => {
    watchedState.rssChannels.forEach(({ channelUrl }) => {
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
        .catch((error) => {
          console.log(error);
        })
        .then(() => watchNewPosts(watchedState));
    });
  }, 5000);
};

const app = () => {
  const state = {
    rssFeedForm: {
      inputStatus: 'empty',
      validationStatus: 'valid',
      validationErrors: [],
      submitButtonStatus: 'disabled',
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
  }).then(() => (
    watchState(state)
  )).then((result) => {
    const watchedState = result;
    const rssFeedForm = document.querySelector('#rssFeedForm');
    const localeDropdownMenu = document.querySelector('#localeDropdownMenu');

    const schema = yup.object().shape({
      feedUrl: yup.string().url('notURL').required('notEmpty'),
    });

    rssFeedForm.addEventListener('input', (e) => {
      watchedState.rssFeedForm.inputStatus = 'typing';
      const formData = new FormData(e.currentTarget);
      const feedUrl = formData.get('feedUrl');
      schema.validate({ feedUrl })
        .then(() => {
          watchedState.rssFeedForm.validationStatus = 'valid';
          watchedState.rssFeedForm.submitButtonStatus = 'enabled';
          watchedState.rssFeedForm.validationErrors = [];
        })
        .catch(({ errors }) => {
          watchedState.rssFeedForm.validationStatus = 'invalid';
          watchedState.rssFeedForm.submitButtonStatus = 'disabled';
          watchedState.rssFeedForm.validationErrors = errors;
        });
    });
    rssFeedForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const feedUrl = formData.get('feedUrl');
      const isAlreadyAdded = some(state.rssChannels, { channelUrl: feedUrl });
      if (isAlreadyAdded) {
        watchedState.rssFeedForm.validationStatus = 'invalid';
        watchedState.rssFeedForm.submitButtonStatus = 'disabled';
        watchedState.rssFeedForm.validationErrors = ['rssAlreadyAdded'];
      } else {
        getRssFeed(feedUrl)
          .then((response) => {
            const parsedRssFeedData = parseRssFeed(response.data);
            watchedState.rssFeedForm.inputStatus = 'added';
            watchedState.rssFeedForm.validationErrors = [];
            watchedState.rssFeedForm.submitButtonStatus = 'disabled';
            watchedState.rssChannels = [
              { ...parsedRssFeedData.channel, channelUrl: feedUrl },
              ...watchedState.rssChannels,
            ];
            watchNewPosts(watchedState);
          })
          .catch(() => {
            watchedState.rssFeedForm.validationErrors = ['networkError'];
          });
      }
    });

    localeDropdownMenu.addEventListener('click', (e) => {
      e.preventDefault();
      watchedState.currentLocale = e.target.textContent;
    });
  });
};

export default app;
