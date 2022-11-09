const makeWASocket = require('@adiwajshing/baileys')['default']
const { DisconnectReason, useSingleFileAuthState, downloadMediaMessage } = require('@adiwajshing/baileys')
const { state } = useSingleFileAuthState('./login.json')
const { Sw, SavedNowa } = require('./models')
const fs = require('fs')
const bot = require('./telebot')

function connectToWhatsApp() {
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            var _a, _b
            const shouldReconnect = ((_b = (_a = lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode) !== DisconnectReason.loggedOut
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })

    sock.ev.on('messages.upsert', (m) => {
        m.messages.forEach(message => {
            listen_sw(sock, message).catch(e => {
                console.error(e)
            })
        })
    })
}

const listen_sw = async (sock, message) => {
    // console.log(message)
    if (message.key.remoteJid !== 'status@broadcast' || message.key.fromMe) {
        return
    }

    const senderNumber = message.key.participant

    if (!(await SavedNowa.findOne({nowa: senderNumber}).exec())) {
        bot.sendMessage('-703267826', `Kontak yang belum kamu save terdeteksi!\n\nNomor: ${senderNumber}\nNama: ${message.pushName}`)
        SavedNowa.create({
            nowa: senderNumber,
        })
    }

    // await sock.readMessages([message.key])
    // if (Array.isArray(message.messageStubParameters) || (message.message && message.message.senderKeyDistributionMessage)) {
    //     return;
    // }

    // if  (message.message && message.message.protocolMessage) {
    //     return;
    // }

    // const imageMessage = message.message.imageMessage
    // const videoMessage = message.message.videoMessage
    // const stickerMessage = message.message.stickerMessage
    // const extendedTextMessage = message.message.extendedTextMessage
    // const quotedMessageContext = extendedTextMessage && extendedTextMessage.contextInfo && extendedTextMessage.contextInfo
    // const quotedMessage = quotedMessageContext && quotedMessageContext.quotedMessage
    // const textMessage = message.message.conversation || message.message.extendedTextMessage && message.message.extendedTextMessage.text || imageMessage && imageMessage.caption || videoMessage && videoMessage.caption
    // let command, parameter
    
    // if (textMessage) {
    //     let a = textMessage.trim().split("\n")
    //     let b = ""
    //     command = a[0].split(" ")[0]
    //     b += a[0].split(" ").slice(1).join(" ")
    //     b += a.slice(1).join("\n")
    //     parameter = b.trim()
    // }

    // if (imageMessage) {
    //     for (let i = 0; i < 13; i++) {
    //         try {
    //             const buffer = await downloadMediaMessage(message, 'buffer')
    //             const chat = await bot.sendPhoto('-710611557', buffer, {
    //                 caption: `${senderNumber} - ${message.pushName}\n\nCaption: ` + textMessage,
    //             })

    //             Sw.create({
    //                 nowa: senderNumber,
    //                 file_id: chat.photo.slice(-1)[0].file_id,
    //                 type: 'image',
    //                 caption: textMessage,
    //             })


    //             break

    //         } catch(e) {

    //             console.error(e)
                
    //         }
    //     }
    // } else if (videoMessage) {
    //     for (let i = 0; i < 13; i++) {
    //         try {

    //             const buffer = await downloadMediaMessage(message, 'buffer')
    //             const chat = await bot.sendVideo('-710611557', buffer, {
    //                 caption: `${senderNumber} - ${message.pushName}\n\nCaption: ` + textMessage,
    //             })

    //             Sw.create({
    //                 nowa: senderNumber,
    //                 file_id: chat.photo.slice(-1)[0].file_id,
    //                 type: 'video',
    //                 caption: textMessage,
    //             })

    //             break

    //         } catch(e) {

    //             console.error(e)

    //         }
    //     }
    // } else if (textMessage) {
    //     await bot.sendMessage('-710611557', `${senderNumber} - ${message.pushName}\n\nCaption: ` + textMessage,)
    //     Sw.create({
    //         nowa: senderNumber,
    //         type: 'text',
    //         caption: textMessage,
    //     })
    // }
}

connectToWhatsApp()