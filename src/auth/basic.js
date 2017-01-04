import { BAD_REQUEST } from '../errors';

export default function(encodedPass) {
  const decoded = new Buffer(encodedPass, 'base64').toString();
  const colonIndex = decoded.indexOf(':');
  if (colonIndex < 0) {
    return Promise.reject(new Error(BAD_REQUEST));
  }

  const username = decoded.slice(0, colonIndex);
  const password = decoded.slice(colonIndex + 1);

  return { username, password };
}

