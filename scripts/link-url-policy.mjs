export const HTTPS_ONLY_MESSAGE = 'Vain HTTPS-osoitteet hyväksytään';

export const evaluateHttpsUrl = (rawUrl) => {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return {
      accepted: false,
      code: 'invalid_url',
      note: 'Virheellinen URL',
      url: null,
    };
  }

  if (url.protocol !== 'https:') {
    return {
      accepted: false,
      code: 'https_required',
      note: `${HTTPS_ONLY_MESSAGE} (löytyi ${url.protocol || 'tuntematon protokolla'})`,
      url,
    };
  }

  return {
    accepted: true,
    code: 'ok',
    note: '',
    url,
  };
};
