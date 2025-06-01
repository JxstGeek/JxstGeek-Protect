export default {
    name: "unlock",
    description: "Déverrouille un salon. `+unlock [#salon]`",
    async execute(message, args, client, config) {
        if (!message.member.roles.cache.some(r => config.adminRoles.includes(r.id))) {
            await message.reply("Tu n'as pas la permission d'utiliser cette commande.");
            return;
        }
        const channel = message.mentions.channels.first() || message.channel;
        try {
            await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: true });
            await message.channel.send(`🔓 Salon ${channel} déverrouillé.`);
        } catch {
            await message.reply("Impossible de déverrouiller ce salon.");
        }
    }
};