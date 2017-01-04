import express  from 'express';

import db       from '../../models/db';
import { ApiError, FORBIDDEN, ERRNO_FORBIDDEN } from '../../errors';

import { finalizeAuth } from './utils';

const router = express.Router();

router.post('/', (req, res) => {
  db()
    .then(models => {
      const { AUTH_PROVIDER, BASIC, authenticate } = models.Users;

      if (req.headers.authorization) {
        // For now we only accept basic authentication and only for the
        // admin user.
        const pass = req.headers.authorization.substr('Basic '.length);

        return authenticate(BASIC, pass);
      }

      const { provider, token } = req.body;
      return authenticate(AUTH_PROVIDER, { provider, token });
    })
    .then(
      finalizeAuth(res),
      err => ApiError(res, 403, ERRNO_FORBIDDEN, FORBIDDEN, err.message)
    );
});

export default router;
