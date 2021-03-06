import onChange from 'on-change';
import i18next from 'i18next';
import * as renders from './renders';


export default (state) => {
  renders.renderLocaleButton(state.currentLocale);
  renders.renderAppTitle(i18next.t('appTitle'));
  renders.renderSubmitButtonTitle(i18next.t('rssFeedForm.addButton'));
  renders.renderInputFieldPlaceholder(i18next.t('rssFeedForm.inputPlaceholder'));
  return onChange(state, (path, value) => {
    switch (path) {
      case 'rssChannels':
        renders.renderRssChannels(value);
        break;
      case 'rssPosts':
        renders.renderRssPosts(value);
        break;
      case 'validationErrors': {
        const errorMessages = value.map((errorCode) => i18next.t(`errors.${errorCode}`));
        renders.renderValidationErrors(errorMessages);
        break;
      }
      case 'currentLocale': {
        i18next.changeLanguage(value);
        renders.renderAppTitle(i18next.t('appTitle'));
        renders.renderLocaleButton(value);
        const errorMessages = state.validationErrors.map((errorCode) => i18next.t(`errors.${errorCode}`));
        renders.renderValidationErrors(errorMessages);
        renders.renderSubmitButtonTitle(i18next.t('rssFeedForm.addButton'));
        renders.renderInputFieldPlaceholder(i18next.t('rssFeedForm.inputPlaceholder'));
        break;
      }
      case 'rssFeedFormState': {
        switch (value) {
          case 'initial':
            renders.resetForm();
            break;
          case 'filling':
            renders.renderSubmitButton('enabled');
            renders.renderInputField('valid');
            break;
          case 'fillingWithErrors':
          case 'processingFailed':
            renders.renderSubmitButton('disabled');
            renders.renderInputField('invalid');
            break;
          case 'processing':
            renders.renderSubmitButton('disabled');
            break;
          default:
            throw new Error(`Unknown rssFeedForm state ${value}`);
        }
        break;
      }
      default:
        throw new Error(`No action for path "${path}"`);
    }
  });
};
