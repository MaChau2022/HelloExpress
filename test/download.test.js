const { expect } = require('chai')
const { describe } = require('mocha')
const path = require('path');
const fsPromise = require('fs/promises')

const request = require('../utils/request')
const read = require('../utils/readResponse')

const origin = 'http://localhost:8080'
const source = path.resolve(__dirname, '../assets/lyrics.txt')
const dist = path.resolve(__dirname, '../assets/echo.txt')

describe('Download', function() {
    it('Lyrics', async function() {
        const buffer = await fsPromise.readFile(source)
        const content = buffer.toString();
        const res = await request({
            urlname: origin + '/download/lyrics',
        })
        const data = await read(res);
        expect(data).to.equal(content)
    })

    it.only('Lyrics segments', async function() {
        const meta = await request({
            urlname: origin + '/download/lyrics',
            method: 'HEAD'
        })
        const size = Number(meta.headers['content-length'])
        const buffer = await fsPromise.readFile(source)
        const content = buffer.toString();
        expect(size).to.be.equal(content.length)


        /** Prepare file handler */
        await fsPromise.writeFile(dist, '');
        const fd = await fsPromise.open(dist, 'r+');

        let from = 0;
        const chunk = 100;
        while(from < size) {
            const to = Math.min(from + chunk, size)
            console.log('  from', from, 'to', to);
            const range = `bytes=${from}-${to}`
            const res = await request({
                urlname: origin + '/download/lyrics/segment',
                headers: { range }
            })
            const data = await read(res);
            expect(data).to.equal(content.slice(from, to))

            await fd.write(Buffer.from(data), 0, data.length, from);
            from += 100;
        }

        fd.close()
    })
})