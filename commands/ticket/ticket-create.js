export default {
    name: "ticket-create",
    description: "Crée un ticket pour le support. `+ticket`",
    async execute(message, args, client, config) {
        const roleOverwrites = config.adminRoles.map(roleId => ({
            id: roleId,
            allow: ["ViewChannel", "SendMessages"]
        }));

        const channel = await message.guild.channels.create({
            name: `ticket-${message.author.username}`,
            type: 0, // ChannelType.GuildText
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: ["ViewChannel"]
                },
                {
                    id: message.author.id,
                    allow: ["ViewChannel", "SendMessages"]
                },
                ...roleOverwrites
            ]
        });
        channel.send(`Bonjour ${message.author}, un membre du staff va te répondre sous peu.`);
        message.reply(`Ton ticket a été créé : ${channel}`);
    }
};