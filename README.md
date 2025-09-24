[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/jJjjf4zV)

# Start Development Server

## Environment Variables Setup

Copy the .env.example file to .env and modify it with your actual values:

```bash
cp .env.example .env
```

Then edit `.env` with your secure values:

- `POSTGRES_PASSWORD`: Secure password for PostgreSQL database
- `JWT_SECRET`: Strong secret key for JWT token signing (use a long, random string)
- `SA_WEB_LOGIN_COOKIE_JWT_SIGNINGKEY`: Simple-auth JWT signing key (should match JWT_SECRET)

**Important:** Never commit `.env` to version control - it's already in `.gitignore`. Use strong, unique passwords and keys in production.

### Generating secure JWT secrets:

```bash
# Generate a secure random key (32+ characters recommended)
openssl rand -base64 32
```

## Starting the Application

Then run the following command to start the development server:

```bash
docker-compose up --build
```

## Available Ports

After starting the application, the following services will be available:

- **Frontend (React App)**: http://localhost:3000
- **Game Service**: http://localhost:8001
- **Authentication Service**: http://localhost:8002
- **Stats Service**: http://localhost:8003
- **Logs Service**: http://localhost:8004
- **Database Administration (Adminer)**: http://localhost:8080
- **PostgreSQL Database**: localhost:5432

## Database Administration

You can access Adminer (database administration) at http://localhost:8080/?pgsql=postgres-db&username=postgres&db=memory_game_db

Just enter your password and click "Login".

## Recommended dev workflow by using console

Start (To run container in background and regain terminal without seeing logs of running session)

```bash
docker-compose up -d --build
```

Stop (Stops container -> Not the same as stopping container with ctrl + c when using default command)

```bash
docker-compose down
```
