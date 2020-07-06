export const renderRssChannels = (rssChannels) => {
  const channelsList = document.querySelector('#rssChannels');
  channelsList.innerHTML = rssChannels.reduce((acc, { title, description }) => {
    const rssChannelHtml = `<div class="card mb-2 bg-light border-0">
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${description}.</p>
      </div>
    </div>`;
    return `${acc}${rssChannelHtml}`;
  }, '');
};

export const renderRssPosts = (rssPosts) => {
  const postsList = document.querySelector('#rssPosts');
  postsList.innerHTML = rssPosts.reduce((acc, { title, link }) => {
    const rssPostHtml = `<div class="card mb-1 bg-light border-0">
      <div class="card-body p-1 pl-3">
        <a class="card-text" href="${link}" target="_blank">${title}</a>
      </div>
    </div>`;
    return `${acc}${rssPostHtml}`;
  }, '');
};

export const resetForm = () => {
  const rssFeedForm = document.querySelector('#rssFeedForm');
  rssFeedForm.reset();
};

export const renderValidationErrors = (validationErrors) => {
  const validationFeedback = document.querySelector('#validationFeedback');
  validationFeedback.innerHTML = validationErrors
    .reduce((acc, errorMessage) => (
      `${acc}<div>${errorMessage}</div>`
    ), '');
};

export const renderSubmitButton = (submitButtonStatus) => {
  const submitButton = document.querySelector('#submitButton');
  switch (submitButtonStatus) {
    case 'disabled':
      submitButton.setAttribute('disabled', '');
      break;
    case 'enabled':
      submitButton.removeAttribute('disabled');
      break;
    default:
      throw new Error(`Unknown Add feed button status ${submitButtonStatus}`);
  }
};

export const renderSubmitButtonTitle = (title) => {
  const submitButton = document.querySelector('#submitButton');
  submitButton.textContent = title;
};

export const renderInputField = (validationStatus) => {
  const inputField = document.querySelector('#inputField');
  switch (validationStatus) {
    case 'invalid':
      inputField.classList.add('is-invalid');
      break;
    case 'valid':
      inputField.classList.remove('is-invalid');
      break;
    default:
      throw new Error(`Unknown input field validation status ${validationStatus}`);
  }
};

export const renderInputFieldPlaceholder = (placeholder) => {
  const inputField = document.querySelector('#inputField');
  inputField.removeAttribute('placeholder');
  inputField.setAttribute('placeholder', placeholder);
};

export const renderLocaleButton = (currentLocale) => {
  const localeDropdownMenuButton = document.querySelector('#localeDropdownMenuButton');
  localeDropdownMenuButton.textContent = currentLocale;
};

export const renderAppTitle = (title) => {
  const appTitle = document.querySelector('#appTitle');
  appTitle.textContent = title;
};
