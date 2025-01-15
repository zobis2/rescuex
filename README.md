1 . docker install
curl -fsSL https://get.docker.com | sudo bash && sudo usermod -aG docker $USER && newgrp docker
sudo usermod -aG docker $USER
newgrp docker



ssh-keygen -t rsa -b 4096 -C "zobis2@gmail.com"
cat ~/.ssh/id_rsa.pub

Go to GitHub:

Navigate to Settings > SSH and GPG keys.
Click New SSH Key.
Add a title (e.g., "Ubuntu Machine") and paste the public key.
Save the key.

ssh -T git@github.com
git clone git@github.com:zobis2/rescuex.git
cd rescuex
git remote set-url origin git@github.com:zobis2/rescuex.git
