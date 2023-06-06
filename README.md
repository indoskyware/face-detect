# Deployment guide

1. SSH to server
2. Go to `/var/app/face-detect`
3. Run
   ```
   git pull
   ```
4. Run
   ```
   pm2 reload all
   pm2 restart all
   ```