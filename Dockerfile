FROM node:16 AS build
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build-storybook

FROM nginx:latest
COPY --from=build /app/storybook-static/ /var/www/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
