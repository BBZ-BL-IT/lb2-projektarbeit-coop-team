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

**Important:** Never commit `.env` to version control - it's already in `.gitignore`. Use strong, unique passwords and keys in production.

### Generating secure JWT secrets:

```bash
# Generate a secure random key (32+ characters recommended)
openssl rand -base64 32
```

## Starting the Application

Then run the following command to start the development server:

```bash
docker-compose up -d
```

## Available Ports

After starting the application, the following services will be available:

- **Frontend (React App)**: http://localhost:3000
- **Game Service**: http://localhost:8001
- **Authentication Service**: http://localhost:8002
- **Database Administration (Adminer)**: [http://localhost:8080](http://localhost:8080/?pgsql=postgres-db&username=postgres&db=memory_game_db)
- **PostgreSQL Database**: http://localhost:5432

## Database Administration

You can access Adminer (database administration) at [http://localhost:8080](http://localhost:8080/?pgsql=postgres-db&username=postgres&db=memory_game_db)

Just enter your password and click "Login".

## Recommended dev workflow by using console

Start (To run container in background and regain terminal without seeing logs of running session)

```bash
docker-compose up -d
```

Stop (Stops container -> Not the same as stopping container with ctrl + c when using default command)

```bash
docker-compose down
```

# Distributed Memory Game – Architecture & Functionality

This project is a **distributed, event-driven multiplayer memory game**.  
Multiple Dockerized services communicate via **HTTP, WebSockets, PostgreSQL, and MQTT**.

---

## Architecture Overview

<img width="1600" height="1327" alt="image" src="https://github.com/user-attachments/assets/63dc7c4c-b8c6-4945-b698-816c0104a043" />


---

## System Components

**Frontend Webserver (Container):**  
Displays the user interface and maintains a WebSocket connection to the Game Service.  

**Game Service (Container):**  
Handles core game logic and real-time gameplay. Communicates via MQTT and WebSockets.  

**Stats Service (Container):**  
Manages and stores player statistics. Subscribes to MQTT events.  

**Logging Service (Container):**  
Receives game and statistics logs via MQTT and writes them to local log files.  

**Authentication Service (Container, zix99/simple-auth):**  
Handles user management, login, and registration. Issues JSON Web Tokens (JWT) and stores user data in the PostgreSQL database.  

**Postgres DB Service (Container, postgres):**  
Stores authentication and player statistics data. Serves as the system’s single source of truth.  

---

## Technology Stack

- **Frontend / UI:** React, TypeScript, CSS, WebSockets  
- **Backend / Services:** Node.js (TypeScript) – Game, Stats, and Logging Services  
- **Messaging / Broker:** MQTT Broker (event-driven communication)  
- **Database:** PostgreSQL  
- **Authentication:** simple-auth (JWT-based sessions)  
- **Logging:** File-based logs handled by the Logging Service  

---

## How It Works

1. **Login:** Auth Service issues JWT → stored as cookie in frontend  
2. **Gameplay:** Game Service creates lobby, manages turns & scores  
3. **Realtime:** Socket.IO updates both players with game state  
4. **Game End:** Game Service publishes `game/{id}/end` via MQTT  
   - **Stats Service:** updates player stats in Postgres  
   - **Log Service:** saves event history as JSON  

---
