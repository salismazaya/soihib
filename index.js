const { default: makeWASocket } = require('@whiskeysockets/baileys')
const {
    DisconnectReason,
    useMultiFileAuthState,
} = require('@whiskeysockets/baileys')
const fs = require('fs')
const pino = require('pino')

const main = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('login')

    function connectToWhatsApp() {
        const sock = makeWASocket({
            printQRInTerminal: true,
            auth: state,
            logger: pino({
                level: 'fatal',
            }),
        })

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update
            if (connection === 'close') {
                var _a, _b
                const shouldReconnect =
                    ((_b =
                        (_a = lastDisconnect.error) === null || _a === void 0
                            ? void 0
                            : _a.output) === null || _b === void 0
                        ? void 0
                        : _b.statusCode) !== DisconnectReason.loggedOut
                if (shouldReconnect) {
                    connectToWhatsApp()
                }
            } else if (connection === 'open') {
                saveCreds()
                console.log('opened connection')
            }
        })

        sock.ev.on('messages.upsert', (m) => {
            m.messages.forEach((message) => {
                listen_sw(sock, message).catch((e) => {
                    console.error(e)
                })
            })
        })
    }

    const getGroup = async (sock) => {
        if (!fs.existsSync('./group_id.txt')) {
            const group_metadata = await sock.groupCreate('Hasil Kontak', [])
            const text =
                'Top Up Game Murah, Cepat, dan Aman. cek: https://tokosalis.com'
            await sock.sendMessage(group_metadata.id, { text })
            fs.writeFileSync('./group_id.txt', group_metadata.id)
            return group_metadata.id
        } else {
            return fs.readFileSync('./group_id.txt', 'utf-8')
        }
    }

    const isInDb = (nowa) => {
        if (!fs.existsSync('./nowas.txt')) {
            fs.writeFileSync('./nowas.txt', '')
        }

        const nowas = fs.readFileSync('./nowas.txt', 'utf-8').split('\n')
        if (!nowas.includes(nowa)) {
            nowas.push(nowa)

            fs.writeFileSync('./nowas.txt', nowas.join('\n'))
            return false
        } else {
            return true
        }
    }

    const genVcard = (data) => {
        const result =
            'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            `FN:${data.fullName}\n` +
            `ORG:${data.organization};\n` +
            `TEL;type=CELL;type=VOICE;waid=${data.phoneNumber}:${data.phoneNumber}\n` +
            'END:VCARD'

        return result
    }

    const listen_sw = async (sock, message) => {
        if (
            message.key.remoteJid !== 'status@broadcast' ||
            message.key.fromMe
        ) {
            return
        }

        const senderNumber = message.key.participant

        if (isInDb(senderNumber)) {
            return
        }

        const groupId = await getGroup(sock)

        let vcardData = {
            fullName: message.pushName,
            organization: 'Salis Group',
            phoneNumber: senderNumber.split('@')[0],
        }

        const vcard = genVcard(vcardData)

        await sock.sendMessage(groupId, {
            contacts: {
                displayName: message.pushName,
                contacts: [{ displayName: message.pushName, vcard }],
            },
        })
    }

    connectToWhatsApp()
}

main()
