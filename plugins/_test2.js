/*const handler = async (m, { conn, text }) => {
  if (!text) throw '*[❗] Ingresa el mensaje a enviar con la ubicación*';

  const mensaje = '[❗𝐋𝐈𝐕𝐄 𝐓𝐄𝐒𝐓❗]\n\n' + text + '\n\nEste es un test de liveLocationMessage';

  await conn.relayMessage(m.chat, {
    liveLocationMessage: {
      degreesLatitude: 35.685506276233525,
      degreesLongitude: 139.75270667105852,
      accuracyInMeters: 0,
      degreesClockwiseFromMagneticNorth: 2,
      caption: mensaje,
      sequenceNumber: 2,
      timeOffset: 3,
    },
  }, {}).catch(e => m.reply('*[⚠️] Error al enviar liveLocationMessage:* ' + e));

  m.reply('*[✅] Mensaje de ubicación en vivo enviado exitosamente.*');
};

handler.help = ['testlive <mensaje>'];
handler.tags = ['test'];
handler.command = /^testlive$/i;
handler.owner = true;

export default handler;*/


import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args }) => {
  let stiker = false
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    let img, out

    if (/webp|image|video/.test(mime)) {
      if (/video/.test(mime) && ((q.msg || q).seconds > 10)) 
        return m.reply(`《✧》¡El video no puede durar más de 10 segundos!`)
      
      img = await q.download?.()
      if (!img) return conn.reply(m.chat, `《✧》Por favor, envía una imagen o video para hacer un sticker`, m)

      try {
        stiker = await sticker(img, false, global.sticker2, global.sticker1)
      } catch (e) {
        console.error(e)
        if (/webp/.test(mime)) out = await webp2png(img)
        else if (/image/.test(mime)) out = await uploadImage(img)
        else if (/video/.test(mime)) out = await uploadFile(img)
        if (typeof out !== 'string') out = await uploadImage(img)
        stiker = await sticker(false, out, global.sticker2, global.sticker1)
      }
    } else if (args[0]) {
      if (isUrl(args[0])) {
        stiker = await sticker(false, args[0], global.sticker2, global.sticker1)
      } else {
        return m.reply(`《✧》El link es incorrecto`)
      }
    }

  } catch (e) {
    console.error(e)
    if (!stiker) stiker = e
  } finally {
    if (stiker) {
      conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true, {
        contextInfo: {
          forwardingScore: 200,
          isForwarded: false,
          externalAdReply: {
            showAdAttribution: false,
            title: global.packname,
            body: global.botname,
            mediaType: 2,
            sourceUrl: global.redes,
            thumbnail: global.icons
          }
        }
      }, { quoted: m })
    } else {
      return conn.reply(m.chat, '《✧》Por favor, envía una imagen, video o link válido para hacer un sticker', m)
    }
  }
}

handler.help = ['sticker *<img|url>*']
handler.tags = ['sticker']
handler.command = ['s2', 'sticker2', 'stiker2']
handler.group = false
handler.register = false

export default handler

const isUrl = (text) => /(https?:\/\/[^\s]+(\.jpg|\.jpeg|\.png|\.gif|\.webp|\.mp4))/i.test(text)