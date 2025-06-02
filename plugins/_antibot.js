export async function before(m, { conn, isAdmin, isBotAdmin }) {
  // Solo aplica en grupos
  if (!m.isGroup) return;

  if (m.fromMe) return true;

  const chat = global.db?.data?.chats?.[m.chat];
  const settings = global.db?.data?.settings?.[conn.user?.jid] || {};

  if (!chat?.antiBot) return;

  const isBotMessage = m.id.startsWith('NJX-') ||
                       (m.id.startsWith('BAE5') && m.id.length === 16) ||
                       (m.id.startsWith('B24E') && m.id.length === 20);

  if (!isBotMessage) return;

  if (isBotAdmin) {
    try {
      // Intentar eliminar el mensaje
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant
        }
      });
    } catch (err) {
      console.error(`[antiBot] ❌ Error al eliminar mensaje sospechoso:`, err);
      // Aquí podrías enviar un mensaje de advertencia al grupo si quieres
    }

    try {
      // Intentar expulsar al usuario
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    } catch (err) {
      console.error(`[antiBot] ❌ Error al expulsar a ${m.sender}:`, err);
      // Puedes notificar al grupo solo si el bot no tiene permisos
      if (err?.message?.includes('not-admin') || err?.message?.includes('403')) {
        await conn.sendMessage(m.chat, {
          text: `⚠️ No pude expulsar a ${m.sender} porque no tengo permisos de administrador.`,
        });
      }
    }
  } else {
    console.warn(`[antiBot] ⚠️ No soy admin en ${m.chat}, no puedo actuar.`);
  }
}