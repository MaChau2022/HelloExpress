const url = require('url')
const http = require('http')
const https = require('https')
const readResponse = require('./readResponse')

module.exports = async function(args) {
    const { urlname, headers, method, body } = args;
    const options = url.parse(urlname)

    if (!method) options.method = "GET";
    else options.method = method;

    options.headers = {};
    if (headers) options.headers = headers;
    if (!headers?.["content-type"]) options.headers["content-type"] = "application/json";

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            if (res.statusCode >= 400) reject(new Error("Invalid status code: " + res.statusCode))
            else if (!res.headers['content-type'].includes('application/json')) resolve(res)
            else readResponse(res).then((data) => {
                resolve(JSON.parse(data))
            })
        })
        req.on('error', reject)

        if (body) req.write(JSON.stringify(body))
        req.end()
    })
}