# lws_tetris_client

Run client: 
    "/Applications/Chromium.app/Contents/MacOS/Chromium" --kiosk --app=http://localhost:5173

```bash
#!/bin/bash

cd ~/Document/projects.lws/lws_tetris_client_2 || exit
nohup npm run preview > client_log.txt 2>&1 &

sleep 5

cd ~/Document/projects.lws/lws_tetris_server || exit
nohup python main.py > server_log.txt 2>&1 &

sleep 5

nohup "/Applications/Chromium.app/Contents/MacOS/Chromium" --kiosk --app=http://localhost:5173 > chromium_log.txt 2>&1 &

echo "Alle Anwendungen wurden als Daemons gestartet."
```
