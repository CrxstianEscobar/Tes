let handler = async (m, { conn, text }) => {
    let who;

    if (m.isGroup) {
        if (m.mentionedJid.length > 0) {
            who = m.mentionedJid[0];
        } else if (m.replyMessage && m.replyMessage.sender) {
            who = m.replyMessage.sender;
        } else if (text) {
            who = text.trim();
            if (!who.endsWith('@s.whatsapp.net')) {
                who = `${who}@s.whatsapp.net`;
            }
        } else {
            who = m.sender;
        }
    } else {
        if (text) {
            who = text.trim();
            if (!who.endsWith('@s.whatsapp.net')) {
                who = `${who}@s.whatsapp.net`;
            }
        } else {
            who = m.sender;
        }
    }

    console.log(`Usuario procesado: ${who}`); // Para depuración

    if (!global.db) global.db = {};
    if (!global.db.data) global.db.data = {};
    if (!global.db.data.users) global.db.data.users = {};

    let users = global.db.data.users;

    if (!users[who]) throw `${emoji2} El usuario no tiene datos para deschetar.`;

    users[who].diamantes = 0;
    users[who].exp = 0;
    users[who].level = 0;

    await global.db.write();

    for (let subbot of global.conns) {
        try {
            if (subbot.user) {
                await subbot.sendMessage(m.chat, { text: `/deschetar ${who.split`@`[0]}` });
            }
        } catch (error) {
            console.log(`${msm} Error al deschetar al usuario: ${error.message}`);
        }
    }

    await m.reply(
        `${xowner} *@${who.split`@`[0]}* *Ahora tienes los recursos de antes*`,
        null,
        { mentions: [who] }
    );
};

handler.help = ['deschetar *@user*', 'deschetar *<número>*'];
handler.tags = ['owner'];
handler.command = ['deschetar', 'uncheat'];
handler.register = true;
handler.rowner = true;

export default handler;