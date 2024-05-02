# Alley Local Development Setup Guide

## Setup Database

#### Step 1: Pull the PostgreSQL Docker Image

```bash
docker pull postgres
```

#### Step 2: Create the Docker Container

```bash
docker run --name alley-postgres -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_USER=postgres -e POSTGRES_DB=alley -p 5432:5432 -d postgres
```

Verify the container is running by using Docker Desktop or using the command `docker ps`.

## Setup Express API

#### Step 1: Navigate to the server directory

#### Step 2: Install dependencies

```bash
npm install
```

#### Step 3: Make a copy of the environment file

Copy the `.env.example` file and then rename it to `.env`

#### Step 4: Run the server

```bash
npm run start
```

The API will be accessible over HTTP at http://localhost:8080.

## Setup React Client

#### Step 1: Navigate to the client directory

#### Step 2: Install dependencies

```bash
npm install
```

#### Step 3: Run the Vite dev server

```bash
npm run dev
```

The React application will be accessible at http://localhost:5173.
