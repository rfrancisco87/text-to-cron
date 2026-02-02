# Text to Cron

Convert natural language schedules to cron expressions and vice versa.

## Features

- **Text to Cron**: Enter natural language like "every Monday at 3pm" and get `0 15 * * 1`
- **Cron to Text**: Paste a cron expression and get a human-readable explanation
- **Next Executions**: See the next 5 scheduled run times
- **Copy to Clipboard**: One-click copy for easy use
- **Confidence Indicators**: Know when a pattern can't be exactly expressed in standard cron

## Supported Patterns

### Basic (High Confidence)
- `every minute` → `* * * * *`
- `every 5 minutes` → `*/5 * * * *`
- `every hour` → `0 * * * *`
- `daily at 9am` → `0 9 * * *`
- `every Monday at 3pm` → `0 15 * * 1`
- `weekdays at 8:30am` → `30 8 * * 1-5`

### Monthly
- `1st of every month` → `0 0 1 * *`
- `15th of every month at noon` → `0 12 15 * *`

### Advanced (Shows Warning)
Some patterns like "last Friday of month" or "every 3rd Tuesday" cannot be expressed in standard 5-field cron (they require extended operators like `L` and `#`). The app will show a warning and provide the closest approximation.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [chrono-node](https://github.com/wanasit/chrono) - Natural language date parsing
- [cronstrue](https://github.com/bradymholt/cronstrue) - Cron to human-readable text
- [cron-parser](https://github.com/harrisiirak/cron-parser) - Cron validation and next execution calculation

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

This project is configured for GitHub Pages deployment. Push to the `main` branch to trigger automatic deployment via GitHub Actions.

## License

MIT
