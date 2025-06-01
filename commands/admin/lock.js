export default {
    name: "lock",
    description: "Verrouille un salon (interdit d'écrire à @everyone). `+lock [#salon]`",
    async execute(message, args, client, config) {
        if (!message.member.roles.cache.some(r => config.adminRoles.includes(r.id))) {
            await message.reply("Tu n'as pas la permission d'utiliser cette commande.");
            return;
        }
        const channel = message.mentions.channels.first() || message.channel;
        try {
            await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: false });
            await message.channel.send(`🔒 Salon ${channel} verrouillé.`);
        } catch {
            await message.reply("Impossible de verrouiller ce salon.");
        }
    }
};