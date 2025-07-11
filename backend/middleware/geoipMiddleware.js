const geoip = require('geoip-lite');

const geoipMiddleware = (req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // For local testing, ip might be '::1', so we'll fallback to a test IP.
    if (ip === '::1' || ip === '127.0.0.1') {
        ip = '81.2.69.142'; // A sample London, UK IP address for testing
    }
    const geo = geoip.lookup(ip);
    req.geo = geo; // Attaches { country: 'GB', ... } to the request
    next();
};
module.exports = geoipMiddleware;