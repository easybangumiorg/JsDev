#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const os = require('os');

const filePath = process.argv[2];
var flag_file = false;

if (filePath && fs.existsSync(filePath)) {
    console.log('Focus on js plugin:', filePath);
    flag_file = true;
}

function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    const ips = Object.keys(interfaces).reduce((result, name) => {
        const interface = interfaces[name];
        const ip = interface.find(item => item.family === 'IPv4' && !item.internal);
        if (ip) {
            result.push(ip.address);
        }
        return result;
    }, []);
    return ips;
}

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/log') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const jsonBody = JSON.parse(body);
                if (jsonBody.level && jsonBody.label && jsonBody.msg) {
                    console.log(`${jsonBody.level.toUpperCase()} [${jsonBody.label}]: ${jsonBody.msg}`);
                } else {
                    console.log(jsonBody);
                }
            } catch (e) {
                console.log(e);
                console.log(body);
            }
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Data received');
        });
    } else if (req.method === 'GET' && req.url === '/' && flag_file) {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(data);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const port = 3000;

server.listen(port, () => {
    const listen_ips = getLocalIPAddress()
    console.log(`DevServer is running on http://localhost:${port}`);
    listen_ips.forEach(ip => {
        console.log(`- http://${ip}:${port}`);
    });
});