# coindeed-backend

## Getting Started

Install Node 14.x or run `nvm use` in case of Node Version Manager.

Copy `env-dev` into `.env`

Next run the application like the following. `docker-compose` is only used locally to set up a local postgres db.

    docker-compose up -d
    yarn install
    yarn start:dev

## Testing

tbd

## Environment Variables

`NODE_ENV` possible values are `dev`, `test` or `prod`
`PORT` to run the application
`DATABASE_URL` connection path to the postgres db

## Migrations

Create a migration with

    npx prisma migrate dev --name init

Run migrations locally

    npx prisma migrate dev
