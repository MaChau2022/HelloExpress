const express = require('express')
const middleware = require('./routers/authority')
const download = require('./routers/download')

const app = express();
const port = 8080

app.use(middleware);
app.use(download);

/** FALLBACK */
app.use('*', async function (req, res, next) {
    res.status(404);
    res.send('404 Not Found');
})

app.listen(port, () => {
    console.log(`Example app listening at: http://localhost:${port}`)
})