import jwt      from 'jsonwebtoken';

import config   from '../../config';

export function finalizeAuth(res) {
  return (userData) => {
    const token = jwt.sign(userData, config.get('adminSessionSecret'));
    res.format({
      json: () => res.status(201).json({ token }),
      html: () => {
        res.send(`
          <script>
            localStorage["token"] = "${token}";
            window.close();
          </script>
        `);
      }
    });
  };
}
