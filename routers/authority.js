const express = require('express')
const router = express.Router()

router.get('*', (req, res, next) => {
    req.identity = 'iduck';
    next();
})

router.get('/test/whoami', (req, res) => {
    res.send(`Hello, ${req.identity}!`);
})

module.exports = router