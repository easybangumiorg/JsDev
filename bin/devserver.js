#!/usr/bin/env node

const http = require('http');

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/log') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            console.log('log:', body);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Data received');
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`DevServer is running on http://localhost:${port}`);
});