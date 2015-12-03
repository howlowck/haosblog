FROM nginx:1.9
MAINTAINER Hao Luo "howlowck@gmail.com"

RUN rm /etc/nginx/nginx.conf /etc/nginx/mime.types
COPY ./.docker/nginx.conf /etc/nginx/nginx.conf
COPY ./.docker/mime.types /etc/nginx/mime.types
RUN mkdir /etc/nginx/ssl
COPY ./.docker/default /etc/nginx/sites-enabled/default
COPY ./.docker/default-ssl /etc/nginx/sites-available/default-ssl

COPY ./public /var/www

# expose both the HTTP (80) and HTTPS (443) ports
EXPOSE 80 443

CMD ["nginx"]
