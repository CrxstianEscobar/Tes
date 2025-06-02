//@Dev.Criss 🇦🇱
import { WAMessageStubType } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'
import urlRegexSafe from 'url-regex-safe'

const urlRegex = urlRegexSafe({ strict: false })
let terminalImage
if (global.opts['img']) terminalImage = require('terminal-image')

export default async function (m, conn = { user: {} }) {
  const _name = await conn.getName(m.sender)
  const senderNumber = '+' + m.sender.replace('@s.whatsapp.net', '')
  const senderParsed = PhoneNumber(senderNumber)
  const sender = senderParsed.getNumber('international') + (_name ? ' ~' + _name : '')
  const chat = await conn.getName(m.chat)

  let img
  try {
    if (terminalImage && /sticker|image/gi.test(m.mtype)) {
      img = await terminalImage.buffer(await m.download())
    }
  } catch (e) {
    console.error(e)
  }

  let fileLength = 0
  const msg = m?.msg || {}
  if (msg.vcard) {
    fileLength = msg.vcard.length
  } else if (msg.fileLength) {
    fileLength = typeof msg.fileLength === 'object' && 'low' in msg.fileLength
      ? msg.fileLength.low
      : msg.fileLength
  } else if (msg.axolotlSenderKeyDistributionMessage) {
    fileLength = msg.axolotlSenderKeyDistributionMessage.length
  } else if (m.text) {
    fileLength = m.text.length
  }

  const user = global.DATABASE.data.users[m.sender] || {}
  const meNumber = '+' + (conn.user?.jid || '').replace('@s.whatsapp.net', '')
  const me = PhoneNumber(meNumber).getNumber('international')

  const sizeLabel = fileLength === 0
    ? 0
    : (fileLength / 1000 ** Math.floor(Math.log(fileLength) / Math.log(1000))).toFixed(1)

  const sizeUnit = fileLength === 0
    ? ''
    : ['', ...'KMGTP'][Math.floor(Math.log(fileLength) / Math.log(1000))] || ''

  console.log(`${chalk.green('╭────═[ SHADOW BOT - MD ]═─────⋆')}
${chalk.green('│╭───────────────···')}
${chalk.green('││')}👨‍💻 ${chalk.cyan(`${me} ~${conn.user.name}` + (conn.user.jid === global.conn.user.jid ? '' : ' (Sub Bot)'))}
${chalk.green('││')}⏱️ ${chalk.black(chalk.bgBlue((m.messageTimestamp ? new Date(1000 * (m.messageTimestamp.low || m.messageTimestamp)) : new Date).toTimeString()))}
${chalk.green('││')}📂 ${chalk.black(chalk.bgGreen(WAMessageStubType[m.messageStubType] || ''))}
${chalk.green('││')}${chalk.magenta(`${fileLength} [${sizeLabel} ${sizeUnit}B]`)}
${chalk.green('││')}🥷 ${chalk.redBright(sender)}
${chalk.green('││')}🏦 ${chalk.yellow(`${m?.exp ?? '?'}|${user.exp || 0}|${user.diamond || 0}`)} ${chalk.blueBright('en')}
${chalk.green('││')}💻 ${chalk.cyan(m.chat + (chat ? ' ~ ' + chat : ''))}
${chalk.green('││')}📦 ${chalk.black(chalk.bgBlue(m.mtype ? m.mtype.replace(/message$/i, '').replace('audio', msg?.ptt ? 'PTT' : 'audio').replace(/^./, v => v.toUpperCase()) : ''))}
${chalk.green('│╰────────────────···')}
${chalk.green('╰───────────═┅═──────────')}
`.trim())

  if (img) console.log(img.trimEnd())

  if (typeof m.text === 'string' && m.text.trim()) {
    let log = m.text.replace(/\u200e+/g, '')

    const mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~])(.+?)\1|```((?:.||[\n\r])+?)```)(?=\S?(?:[\s\n]|$))/g
    const mdFormat = (depth = 4) => (_, type, text, monospace) => {
      const types = { _: 'italic', '*': 'bold', '~': 'strikethrough' }
      text = text || monospace
      const formatted = !types[type] || depth < 1
        ? text
        : chalk[types[type]](text.replace(mdRegex, mdFormat(depth - 1)))
      return formatted
    }

    if (log.length < 1024) {
      log = log.replace(urlRegex, (url, i, text) => {
        const end = url.length + i
        return i === 0 || end === text.length || (/^\s$/.test(text[end]) && /^\s$/.test(text[i - 1]))
          ? chalk.blueBright(url)
          : url
      })
    }

    log = log.replace(mdRegex, mdFormat())

    if (m.mentionedJid) {
      for (const id of m.mentionedJid) {
        const name = await conn.getName(id)
        log = log.replace('@' + id.split('@')[0], chalk.blueBright('@' + name))
      }
    }

    console.log(m?.error ? chalk.red(log) : m?.isCommand ? chalk.yellow(log) : log)
  }

  if (Array.isArray(m.messageStubParameters)) {
    const stubs = await Promise.all(m.messageStubParameters.map(async jid => {
      jid = conn.decodeJid(jid)
      const name = await conn.getName(jid)
      return chalk.gray(PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international') + (name ? ' ~' + name : ''))
    }))
    console.log(stubs.join(', '))
  }

  if (/document/i.test(m.mtype)) {
    console.log(`📄 ${msg.fileName || msg.displayName || 'Document'}`)
  } else if (/ContactsArray/i.test(m.mtype)) {
    console.log(`👨‍👩‍👧‍👦`)
  } else if (/contact/i.test(m.mtype)) {
    console.log(`👨 ${msg.displayName || ''}`)
  } else if (/audio/i.test(m.mtype)) {
    const duration = msg?.seconds ?? 0
    console.log(`${msg?.ptt ? '🎤 (PTT ' : '🎵 ('}AUDIO) ${Math.floor(duration / 60).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}`)
  }
}

const file = global.__filename(import.meta.url)
watchFile(file, () => {
  console.log(chalk.redBright("Update 'lib/print.js'"))
})