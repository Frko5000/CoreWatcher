const si = require('systeminformation');
const http = require('http');

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/stats') {
        try {
            const load = await si.currentLoad();
            const mem = await si.mem();
            const disk = await si.fsSize();
            const time = si.time();
            const network = await si.networkInterfaces();
            const defaultNet = await si.networkInterfaceDefault();
            const mainNet = network.find(i => i.iface === defaultNet);

            const data = {
                cpu: Math.round(load.currentLoad),
                ram: Math.round((mem.active / mem.total) * 100),
                disk: Math.round(disk[0].use),
                diskUsed: (disk[0].used / (1024 * 1024 * 1024)).toFixed(1),
                diskTotal: (disk[0].size / (1024 * 1024 * 1024)).toFixed(1),
                ip: mainNet ? mainNet.ip4 : '127.0.0.1',
                uptime: Math.round(time.uptime / 3600)
            };

            res.end(JSON.stringify(data));
        } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
