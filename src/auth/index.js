import basic    from './basic';
import * as facebook from './facebook';

const providers = {};

if (facebook.isConfigured()) {
  providers.facebook = facebook.verifyToken;
}

export { basic, providers };
