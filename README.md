# Pacifica Notify Bot

Telegram bot for wallet-based Pacifica trading notifications.

## MVP features

- Track one or more wallet addresses with `/track <wallet>`
- Stop tracking with `/untrack <wallet>`
- List tracked wallets with `/list`
- Poll Pacifica REST endpoints for wallet state
- Alert on:
  - position opened
  - position closed
  - position size changed
  - liquidation proximity warning (within 10%)

## Setup

```bash
cp .env.example .env
```

Fill in:

- `TELEGRAM_BOT_TOKEN`
- optional `PACIFICA_BASE_URL`
- optional `POLL_INTERVAL_MS`
- optional `DATABASE_PATH`

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Notes

This bot uses Solana-format Pacifica account identifiers via:

- `GET /account?account=<solana_address>`
- `GET /positions?account=<solana_address>`
- `GET /trades/history?account=<solana_address>`

Users should submit a Solana account address when tracking.

## Next improvements

- infer TP/SL closures more accurately
- add per-user alert preferences
- dedupe liquidation warnings
- move from polling to websocket if public wallet streams are possible
- add admin metrics and healthcheck endpoint
