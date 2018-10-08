# Mugengo Server

[![Build Status](https://travis-ci.com/dricholm/mugengo-server.svg?branch=master)](https://travis-ci.com/dricholm/mugengo-server)

A webapp for learning new languages by talking to people from all over the world. Backend part built using [NestJS](https://nestjs.com/). The [frontend](https://github.com/dricholm/mugengo-ui) repo can also be found on GitHub.

> Note: Under development, not yet released

## For developers

### Installation

Install the dependencies using `npm install`. Make a copy of `.env.example` as `.env` and fill in the environment values. The server needs a PostgreSQL server running.

### Running the server

```bash
# Development
$ npm run start

# Watch mode
$ npm run start:dev
```

## Test

```bash
# Unit tests
$ npm run test

# E2E tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```
