# react

FROM node:18-alpine AS react_docker

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./ ./

RUN npm run build

# nginx

FROM nginx:1.22.1-alpine

COPY --from=react_docker /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]