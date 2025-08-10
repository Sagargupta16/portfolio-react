// Image handling
export const getImageUrl = (path) => {
  try {
    return require(`../assets/images/${path}`);
  } catch (e) {
    return require('../assets/images/Empty.jpg');
  }
};

// Text formatting
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
};

// Array handling
export const chunkArray = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

// String manipulation
export const truncate = (str, length = 100) =>
  str.length > length ? `${str.substring(0, length)}...` : str;

// Object handling
export const pick = (obj, keys) =>
  keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});

// DOM helpers
export const scrollToTop = () =>
  window.scrollTo({ top: 0, behavior: 'smooth' });

// Validation helpers
export const isValidEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);

// Device detection
export const isMobile = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

// Error handling
export const tryAndCatch = async (promise) => {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error];
  }
};
