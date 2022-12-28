@echo on

SET PM2_HOME=C:\Users\Administrator\.pm2

pm2 stop D:\WebApplications\Rgl_Skf\app.js

pm2 start D:\WebApplications\Rgl_Skf\app.js

