FROM node:8.14.1-alpine as build-env

RUN apk --update add git openssh && \
    rm -rf /var/lib/apt/lists/* && \
    rm /var/cache/apk/*

WORKDIR /work

# restore package in a separate layer
ADD package.json yarn.lock ./
RUN yarn

COPY . ./
RUN yarn build

FROM nginx:stable
EXPOSE 80
COPY --from=build-env /work/build/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf