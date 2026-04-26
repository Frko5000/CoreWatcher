const http = require('http');
const si = require('systeminformation');

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/api/stats') {
        try {
            const [cpu, mem, disk, os, time] = await Promise.all([
                si.currentLoad(),
                si.mem(),
                si.fsSize(),
                si.osInfo(),
                si.time()
            ]);

            const stats = {
                cpu: cpu.currentLoad.toFixed(1),
                ramUsed: (mem.active / 1024 / 1024 / 1024).toFixed(2),
                ramTotal: (mem.total / 1024 / 1024 / 1024).toFixed(2),
                ramPercent: ((mem.active / mem.total) * 100).toFixed(1),
                diskUsed: (disk[0].used / 1024 / 1024 / 1024).toFixed(2),
                diskPercent: disk[0].use.toFixed(1),
                hostname: os.hostname,
                platform: os.platform,
                uptime: (time.uptime / 3600).toFixed(1),
                bootTime: new Date(time.uptime * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };

            res.end(JSON.stringify(stats));
        } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "System error" }));
        }
    }
});

server.listen(5000, () => {
    console.log("CoreWatcher Engine Active on Port 5000");
});