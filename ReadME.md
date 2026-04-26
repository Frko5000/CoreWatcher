# 🖥️ CoreWatcher

corewatcher is a lightweight system monitor dashboard that maded with node.js and vanilla js. simple tool to track your pc stats without lag.

## ⚖️ optimization issue
at first (v1.0), i tried to show top processes every 2 seconds and it used like 40% of my cpu lmao 

**fixed it:**
* removed the heavy process scanning part.
* changed refresh rate to 5 seconds.
* now it uses almost 5% cpu. 

## ✨ features
* super light on resources.
* tracks cpu, ram and disk.
* shows uptime and boot time.
* dark theme for the eyes.

## 🛠️ tech stack
* node.js & systeminformation api.
* html5, css grid, vanilla js.

## 🚀 getting started

1. install:
```bash
npm install systeminformation
run:

Bash
node server.js
open index.html and u r ready

claude is love :3
