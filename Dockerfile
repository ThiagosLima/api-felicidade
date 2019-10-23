# Multistage docker for 3 environments
# 1) Production environment
FROM node:12.13.0-alpine as prod
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# Optimized installation for production
RUN npm install --only=production \
  && npm cache clean --force
COPY . .
CMD [ "node", "index.js" ]

# 2) Development environment
FROM prod as dev
ENV NODE_ENV=development
RUN npm install --only=development
CMD [ "./node_modules/nodemon/bin/nodemon.js", "index.js" ]

# 3) Test environment
FROM dev as test
ENV NODE_ENV=development
CMD ["npm", "test"]
