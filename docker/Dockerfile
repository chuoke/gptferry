FROM node:18-alpine AS build

WORKDIR /app

COPY ./ ./

# RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.bashrc" SHELL="$(which bash)" bash -
# RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -
RUN npm install -g pnpm

RUN pnpm install
RUN pnpm build

# ----------------------------- #

FROM nginx:alpine AS runner

WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist/ ./

EXPOSE 80
