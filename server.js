const si = require('systeminformation');
const http = require('http');
 
const cache = {
    load:         { data: null, ts: 0, ttl: 2000  },
    mem:          { data: null, ts: 0, ttl: 3000  },
    disk:         { data: null, ts: 0, ttl: 10000 },
    network:      { data: null, ts: 0, ttl: 10000 },
    networkIface: { data: null, ts: 0, ttl: 30000 },
    temp:         { data: null, ts: 0, ttl: 3000  },
    gpu:          { data: null, ts: 0, ttl: 3000  },
};
 
async function getCached(key, fetchFn) {
    const entry = cache[key];
    const now = Date.now();
    if (entry.data && (now - entry.ts) < entry.ttl) return entry.data;
    try {
        entry.data = await fetchFn();
        entry.ts = now;
    } catch { /* eski veriyi döndür */ }
    return entry.data;
}
 
async function buildStats() {
    const [load, mem, disk, network, defaultNet, temps, gpu] = await Promise.all([
        getCached('load',         () => si.currentLoad()),
        getCached('mem',          () => si.mem()),
        getCached('disk',         () => si.fsSize()),
        getCached('network',      () => si.networkInterfaces()),
        getCached('networkIface', () => si.networkInterfaceDefault()),
        getCached('temp',         () => si.cpuTemperature()),
        getCached('gpu',          () => si.graphics()),
    ]);
 
    const time = si.time();
 
    const mainNet = Array.isArray(network)
        ? network.find(i => i.iface === defaultNet) || network[0]
        : null;
 
    const gpuController = gpu?.controllers?.[0];
 
    let cpuTemp = temps?.main ?? null;
    if (cpuTemp === null && Array.isArray(temps?.cores) && temps.cores.length) {
        const valid = temps.cores.filter(t => t > 0);
        cpuTemp = valid.length
            ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
            : null;
    }
 
    return {
        cpu:      Math.round(load?.currentLoad ?? 0),
        ram:      Math.round(((mem?.active ?? 0) / (mem?.total ?? 1)) * 100),
        ramUsed:  ((mem?.active ?? 0) / (1024 ** 3)).toFixed(1),
        ramTotal: ((mem?.total  ?? 0) / (1024 ** 3)).toFixed(1),
        disk:     Math.round(disk?.[0]?.use ?? 0),
        diskUsed: ((disk?.[0]?.used ?? 0) / (1024 ** 3)).toFixed(1),
        diskTotal:((disk?.[0]?.size ?? 0) / (1024 ** 3)).toFixed(1),
        ip:       mainNet?.ip4 ?? '127.0.0.1',
        uptime:   Math.round((time?.uptime ?? 0) / 3600),
        cpuTemp:  cpuTemp !== null ? Math.round(cpuTemp) : null,
        gpuName:  gpuController?.model    ?? null,
        gpuTemp:  gpuController?.temperatureGpu ?? null,
        gpuVram:  gpuController?.vram     ?? null,
    };
}
 
const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
 
    if (req.url === '/stats') {
        try {
            const data = await buildStats();
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
    console.log('CoreWatcher running on http://localhost:3000');
});
 
