FROM node:18.17.0 AS build
WORKDIR /app
COPY . .
RUN npm i -g pnpm
RUN pnpm install
RUN pnpm build-storybook

FROM nginx:latest
COPY --from=build /app/storybook-static/ /var/www/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
