import config   from '../config';
import {
  UNAUTHORIZED,
  UNSUPPORTED_AUTH_METHOD,
} from '../errors';

import { basic, providers } from '../auth';

// Supported authentication methods.
const authMethods = {
  BASIC: (encodedPass) => {
    const { username, password } = basic(encodedPass);

    // For now we only support admin authentication.
    if (username !== 'admin' || password !== config.get('adminPass')) {
      return Promise.reject(new Error(UNAUTHORIZED));
    }

    return Promise.resolve({
      id: 'admin',
      scope: 'admin'
    });
  },

  AUTH_PROVIDER: ({ provider, token }) => {
    const providerVerify = providers[provider];
    if (!providerVerify) {
      return Promise.reject(new Error(`Provider "${provider}" is unknown.`));
    }

    return providerVerify(token)
      .then(opaqueId => ({
        id: { opaqueId, provider },
        scope: 'user'
      }));
  },
};

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('Users', {
    identifier: { type: DataTypes.STRING(256), primaryKey: true }
  });

  User.authenticate = (method, data) => {
    if (!authMethods[method]) {
      return Promise.reject(new Error(UNSUPPORTED_AUTH_METHOD));
    }

    return authMethods[method](data);
  };

  Object.keys(authMethods).forEach(key => { User[key] = key; });

  return User;
};
