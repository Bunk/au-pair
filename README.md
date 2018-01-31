# aupair

[![NPM Version][npm-image]][npm-url]
[![Build][ci-image]][ci-url]
[![Coverage][coverage-image]][coverage-url]

A digital au-pair that monitors the health of your dependents.

### Example Setup

```javascript
const aupair = require('aupair')

aupair.addCheck({
    key: 'rabbit',
    interval: 30000,
    check () {
        cachedPromise = new Promise(resolve => {
            rabbit.on('disconnected', resolve(
                { status: 'failed', message: 'Disconnected from Rabbit', uri: rabbit.uri }
            ))
            rabbit.on('connected', resolve(
                { status: 'ok', message: 'All good', uri: rabbit.uri }
            ))
        })
    }
}, {
    key: 'github.com',
    async check () {
        const response = await request('https://github.com/status')
        return response.status === 200
            ? { status: 'ok', message: 'All good', resp: response }
            : { status: 'failed', message: 'Unavailable', resp: response }
    }
})
```

### Response

```json
{
    "status": "failed",
    "details": {
        "rabbit": {
            "status": "ok"
        },
        "github.com": {
            "status": "failed"
        }
    },
    "started": "293741973492",
    "uptime": "1d 30m"
}
```

[npm-image]: https://badge.fury.io/js/aupair.svg
[npm-url]: https://npmjs.org/package/aupair
[ci-image]: https://travis-ci.org/Bunk/aupair.svg?branch=master
[ci-url]: https://travis-ci.org/Bunk/aupair
[coverage-image]: https://coveralls.io/repos/github/Bunk/aupair/badge.svg
[coverage-url]: https://coveralls.io/github/Bunk/aupair
