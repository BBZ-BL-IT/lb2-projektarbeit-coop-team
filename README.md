[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/jJjjf4zV)

# Start Development Server

Copy the .env.example file to .env and modify it as needed.

Then run the following command to start the development server:

```bash
docker-compose up --build
```

## Recommended dev workflow by using console

Start (To run container in background and regain terminal without seeing logs of running session)
```bash
docker-compose up -d --build
```

Stop (Stops container -> Not the same as stopping container with ctrl + c when using default command)
```bash
docker-compose down
```
