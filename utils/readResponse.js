module.exports = async function read(res) {
    return new Promise((resolve, reject) => {
        const buffer = [];
        res.on('data', (chunk) => buffer.push(chunk));
        res.on('end', () => {
            resolve(Buffer.concat(buffer).toString())
        })
        res.on('error', reject)
    });
} 