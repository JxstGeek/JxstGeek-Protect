export default {
    name: "antilink",
    description: "Active ou désactive l'antilink. `+antilink`",
    async execute(message, args, client, config) {
        if (!config.antiLink) return;
        if (/(https?:\/\/|discord\.gg\/)/i.test(message.content)) {
            if (!message.member.permissions.has("ManageMessages")) {
                await message.delete().catch(() => {});
                if (config.logChannel) {
                    const logChan = message.guild.channels.cache.get(config.logChannel);
                    if (logChan) logChan.send(`Lien supprimé de ${message.author} : ${message.content}`);
                }
                return message.channel.send(`${message.author}, les liens sont interdits !`);
            }
        }
    }
};