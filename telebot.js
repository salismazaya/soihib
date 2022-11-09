const TeleBot = require('telebot')

const bot = new TeleBot({
    token: 'TELEGRAM_TOKEN',
    polling: {
        interval: 1000,
        timeout: 0,
        limit: 10,
        retryTimeout: 5000,
    }
})

bot.on(['/start'], (message) => {
    console.log(message)
})

// bot.start()

module.exports = bot