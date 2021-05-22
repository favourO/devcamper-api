const logger = (req, res, next) => {
    req.hi = 'Boy u dope mehnn';
    console.log(`${req.method} ${req.protocol}//${req.url}`);
    next();
}

module.exports = logger;