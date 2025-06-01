const userSpam = new Map();

export default {
    name: "antispam",
    description: "Active ou désactive l’anti-spam. `+antispam [on/off]`",
    async execute(message, args, client, config) {
        if (!config.antiSpam) return;
        const now = Date.now();
        const data = userSpam.get(message.author.id) || { count: 0, last: 0 };
        if (now - data.last < 2000) {
            data.count++;
            if (data.count > 5) {
                await message.delete().catch(() => {});
                if (config.logChannel) {
                    const logChan = message.guild.channels.cache.get(config.logChannel);
                    if (logChan) logChan.send(`Spam détecté de ${message.author}`);
                }
                return message.channel.send(`${message.author}, évite de spammer !`);
            }
        } else {
            data.count = 1;
        }
        data.last = now;
        userSpam.set(message.author.id, data);
    }
};