export default {
    name: "stats",
    description: "Affiche quelques statistiques bot/serveur",
    async execute(message, args, client, config) {
        if (!message.member.roles.cache.some(r => config.adminRoles.includes(r.id))) {
            await message.reply("Tu n'as pas la permission d'utiliser cette commande.");
            return;
        }
        const embed = {
            color: 0x5865F2,
            title: "Statistiques",
            fields: [
                { name: "Serveurs", value: `${client.guilds.cache.size}`, inline: true },
                { name: "Membres (ce serveur)", value: `${message.guild.memberCount}`, inline: true },
                { name: "Salons", value: `${message.guild.channels.cache.size}`, inline: true },
                { name: "Uptime", value: `<t:${Math.floor((Date.now() - client.uptime)/1000)}:R>`, inline: false },
                { name: "Ping", value: `${client.ws.ping} ms`, inline: false }
            ]
        };
        await message.channel.send({ embeds: [embed] });
    }
};