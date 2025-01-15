FROM nginx

RUN apt-get update && apt-get install -y curl

# Copy NGINX configuration
COPY default.conf /etc/nginx/conf.d/default.conf

# Create directories and copy files if they exist
RUN mkdir -p /etc/letsencrypt /var/www/certbot && \
    if [ -d "../certbot/conf" ]; then cp -r ../certbot/conf/* /etc/letsencrypt/; fi && \
    if [ -d "../certbot/www" ]; then cp -r ../certbot/www/* /var/www/certbot/; fi

# Copy the monitoring script
COPY monitor.sh /usr/local/bin/monitor.sh

# Make the monitoring script executable
RUN chmod +x /usr/local/bin/monitor.sh

# Start the monitoring script and NGINX
CMD ["sh", "-c", "/usr/local/bin/monitor.sh & nginx -g 'daemon off;'"]
