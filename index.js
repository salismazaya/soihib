require('./whatsapp')

const http = require('http')

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('!');
})

server.listen(process.env.PORT || 3000)