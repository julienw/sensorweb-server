/**
 * Route middleware to verify session tokens.
 */

import jwt    from 'jsonwebtoken';
import config from '../config';
import db     from '../models/db';

import {
  ApiError,
  ERRNO_UNAUTHORIZED,
  UNAUTHORIZED
} from '../errors';

function unauthorized(res) {
  ApiError(res, 401, ERRNO_UNAUTHORIZED, UNAUTHORIZED);
}

export default (scopes) => {
  // For now we only allow 'admin' scope.
  const validScopes = ['admin', 'client', 'user'].filter(
    scope => scopes.includes(scope)
  );

  if (!validScopes.length) {
    throw new Error(`No valid scope found in "${scopes}"`);
  }

  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const authQuery = req.query.authorizationToken;

    if (!authHeader && !authQuery) {
      return unauthorized(res);
    }

    let token;
    if (authHeader) {
      token = authHeader.split('Bearer ')[1];
      if (!token) {
        return unauthorized(res);
      }
    } else {
      token = authQuery;
    }

    // Because we expect to get tokens signed with different secrets, we first
    // need to get the owner of the token so we can get the appropriate secret.
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.id || !decoded.scope) {
      return unauthorized(res);
    }

    if (!validScopes.includes(decoded.scope)) {
      // TODO log
      return unauthorized(res);
    }

    let secretPromise;
    switch(decoded.scope) {
      case 'client':
        secretPromise = db()
          .then(({ Clients }) => Clients.findById(decoded.id))
          .then(client => client.secret);
        break;
      case 'user':
      case 'admin':
        secretPromise = Promise.resolve(config.get('adminSessionSecret'));
        break;
      default:
        // should not happen because we check this earlier
        next(new Error(`Unknown scope ${decoded.scope}`));
    }

    // Verify JWT signature.
    secretPromise.then(secret => {
      jwt.verify(token, secret, (error) => {
        if (error) {
          // TODO log
          return unauthorized(res);
        }

        req.user = decoded;
        return next();
      });
    }).catch(err => next(err || new Error('Unexpected error')));
  };
};
