import needle from 'needle';
import config from '../config';

function getVerifyUrl() {
  const clientID = config.get('facebook.clientID');
  const clientSecret = config.get('facebook.clientSecret');

  const url =
    `https://graph.facebook.com/debug_token?access_token=${clientID}|${clientSecret}&input_token=`;

  return url;
}

export function verifyToken(token) {
  if (!token) {
    return Promise.reject(new Error('No token was provided'));
  }
  const url = getVerifyUrl() + encodeURIComponent(token);

  return new Promise((resolve, reject) => {
    needle.get(url, { compressed: true }, (err, _res, body) => {
      if (err) {
        reject(err);
        return;
      }

      if (!body || !body.data || !body.data.is_valid) {
        reject(new Error('Invalid token'));
        return;
      }

      resolve(body.data.user_id);
    });
  });
}

export function isConfigured() {
  const clientID = config.get('facebook.clientID');
  const clientSecret = config.get('facebook.clientSecret');

  return clientID && clientSecret;
}
