const handler = async (m, { conn, args, groupMetadata, participants, usedPrefix, command, isBotAdmin, isSuperAdmin }) => {

  if (!args[0]) return conn.reply(m.chat, `*${xgc} Por favor ingresa algún prefijo de país.\n> *\`Ejemplo:\`* ${usedPrefix + command} 212`, m);
  if (!/^\d{1,4}$/.test(args[0])) return conn.reply(m.chat, `${emoji2} Prefijo no válido. Use solo números de 1 a 4 dígitos.`, m);

  const prefix = args[0].replace(/[+]/g, '');
  const bot = global.db.data.settings[conn.user.jid] || {};

  // Filtra usuarios que no sean el bot y comiencen con el prefijo
  const matchedUsers = participants
    .map(u => u.id)
    .filter(id => id !== conn.user.jid && id.startsWith(prefix));

  if (matchedUsers.length === 0)
    return m.reply(`${emoji2} No hay ningún número en este grupo con el prefijo +${prefix}`);

  // Formatea los números para mostrar en mensaje
  const numeros = matchedUsers.map(v => '⭔ @' + v.replace(/@.+/, ''));
  const delay = ms => new Promise(res => setTimeout(res, ms));

  switch (command) {
    case 'listnum':
    case 'listanum':
      return conn.reply(
        m.chat,
        `${emoji} Lista de números con el prefijo +${prefix} en este grupo:\n\n${numeros.join('\n')}`,
        m,
        { mentions: matchedUsers }
      );

    case 'kicknum':
      if (!bot.restrict) return conn.reply(m.chat, `${emoji} Este comando está deshabilitado por el propietario del bot.`, m);
      if (!isBotAdmin) return m.reply(`${emoji2} El bot no es administrador del grupo.`, m);

      const ownerGroup = m.chat.split`-`[0] + '@s.whatsapp.net';
      let count = 0;

      await conn.reply(m.chat, `♻️ Iniciando eliminación de números con el prefijo +${prefix}...`, m);

      for (const user of matchedUsers) {
        if (
          user === conn.user.jid ||
          user === ownerGroup ||
          global.owner.includes(user.split('@')[0]) ||
          user === isSuperAdmin
        ) continue;

        const isAdmin = participants.find(p => p.id === user)?.admin;
        if (isAdmin) continue; // No eliminar admins

        try {
          await delay(2000); // Espera entre expulsiones
          const res = await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
          if (res[0]?.status === '404') {
            const errMsg = `@${user.split('@')[0]} ya fue eliminado o salió del grupo.`;
            m.reply(errMsg, m.chat, { mentions: conn.parseMention(errMsg) });
          } else {
            count++;
          }
        } catch (e) {
          console.error(`❌ Error al eliminar a ${user}:`, e);
        }

        await delay(1000); // Breve espera adicional
      }

      return conn.reply(m.chat, `✅ Eliminación finalizada. Total expulsados: ${count}`, m);
  }
};

handler.command = ['kicknum', 'listnum', 'listanum'];
handler.group = true;
handler.botAdmin = true;
handler.admin = true;
handler.fail = null;

export default handler;