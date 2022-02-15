FROM node:16.14.0-alpine3.14 As build

WORKDIR /app

COPY package*.json ./
RUN npm install --only=development

COPY . .
RUN npm run build

FROM node:16.14.0-alpine3.14

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .
COPY --from=build /app/dist ./dist

CMD ["npm", "run", "start:prod"]
