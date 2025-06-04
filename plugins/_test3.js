const handler = async (m, { conn, text }) => {
  const delay = (time) => new Promise((res) => setTimeout(res, time));

  const allGroups = await conn.groupFetchAllParticipating();
  const groups = Object.entries(allGroups)
    .map(([_, v]) => v)
    .filter((v) => v.id && v.participants);

  const groupIds = groups.map((v) => v.id);

  const message = m.quoted?.text || text;
  if (!message) throw '📩 *Escribe el mensaje que deseas enviar a los grupos.*\n\nPuedes responder un mensaje o escribir uno nuevo.';

  const errores = [];

  m.reply(`📢 Enviando mensaje a *${groupIds.length}* grupo(s)...\nPor favor espera un momento ⏳`);

  for (const id of groupIds) {
    await delay(1000); // Espera 1 segundo entre envíos
    try {
      await conn.relayMessage(
        id,
        {
          liveLocationMessage: {
            degreesLatitude: 35.685506276233525,
            degreesLongitude: 139.75270667105852,
            accuracyInMeters: 0,
            degreesClockwiseFromMagneticNorth: 2,
            caption: `📢 *_COMUNICADO OFICIAL_*\n\n${message}\n\n> Enviado por el equipo Shadow's Club`,
            sequenceNumber: 2,
            timeOffset: 3,
            contextInfo: {
              mentionedJid: [m.sender]
            }
          }
        },
        {}
      );
    } catch (e) {
      errores.push(id);
    }
  }

  m.reply(
    `✅ *Mensaje enviado a ${groupIds.length - errores.length} grupo(s)*\n` +
    `${errores.length ? `❌ Falló en ${errores.length} grupo(s)` : '🎉 Todos los envíos fueron exitosos.'}\n\n` +
    `📌 *Nota:* Este comando puede fallar en algunos chats si el bot fue eliminado o tiene restricciones.`
  );
};

handler.help = ['broadcastgroup', 'bcgc'].map(v => v + ' <mensaje>');
handler.tags = ['owner'];
handler.command = /^(broadcast|bc)(group|grup|gc)$/i;
handler.owner = true;

export default handler;