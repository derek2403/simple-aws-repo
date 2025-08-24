# Student Records (AWS POC)

## 1) Server prep (Ubuntu on EC2)
sudo apt-get update -y
sudo apt-get install -y curl git mysql-server
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo systemctl enable --now mysql

# allow node to bind to port 80 without sudo
sudo setcap 'cap_net_bind_service=+ep' "$(command -v node)"

## 2) Clone and configure
sudo mkdir -p /srv/apps && sudo chown ubuntu:ubuntu /srv/apps
cd /srv/apps
git clone <YOUR_REPO_URL> student-records
cd student-records
cp .env.example .env

# For Phase 2 (local MySQL), edit .env with root password if any.

## 3) Initialize DB locally (Phase 2)
source .env
mysql -uroot -e "SOURCE scripts/init-db.sql;"

## 4) Run the app
npm install
npx pm2 start src/index.js --name student-app
npx pm2 save

# On reboot, pm2 resurrects automatically if pm2 is installed globally; alternatively:
# sudo su -c 'env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu'