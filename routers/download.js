const express = require('express')
const path = require('path')
const router = express.Router()
const fsPromise = require('fs/promises')
const pathname = path.resolve(__dirname, '../assets/lyrics.txt');

router.get('/download/lyrics', async function(req, res) {
    const fd = await fsPromise.open(pathname, 'r');
    const buffer = await fd.readFile();
    res.on('finish', fd.close)
    res.statusCode = 200;
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Type', 'text/plain');
    res.send(buffer);
})

router.head('/download/lyrics', async function(req, res) {
    const fd = await fsPromise.open(pathname, 'r');
    const stat = await fd.stat();
    res.on('finish', fd.close)
    res.statusCode = 200;
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'text/plain');
    res.end();
})

router.get('/download/lyrics/segment', async function(req, res) {
    const range = req.headers.range;
    console.log(range);
    if (!range) res.sendStatus(416);

    /** Format options */
    // const reg = /bytes=(\d+)-(\d+)?/.exec(range);
    const reg = range.match(/bytes=(\d+)-(\d+)/);
    const from = Number(reg[1])
    const to = Number(reg[2])
    const len = to - from;

    /** Check size */
    const fd = await fsPromise.open(pathname, 'r');
    const stat = await fd.stat();
    if (stat.size < to) {
        res.statusCode = 416;
        res.setHeader('Content-Range', `bytes */${stat.size}`);
        res.end();
        return;
    }

    /** Send chunk */
    const buffer = Buffer.alloc(len);
    await fd.read(buffer, 0, len, from);
    res.statusCode = 206;
    res.on('finish', fd.close)
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'text/plain');
    res.send(buffer);
})

module.exports = router