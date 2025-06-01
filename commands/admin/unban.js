export default {
    name: "unban",
    description: "Unban un utilisateur via son ID ou username#tag. `+unban [id|tag]`",
    async execute(message, args, client, config) {
        if (!message.member.roles.cache.some(r => config.adminRoles.includes(r.id))) {
            await message.reply("Tu n'as pas la permission d'utiliser cette commande.");
            return;
        }
        if (!args[0]) return message.reply("Indique l'ID ou le tag du membre à unban.");

        const bans = await message.guild.bans.fetch();
        // Recherche par ID direct
        let user = bans.find(ban => ban.user.id === args[0]);
        // Recherche par tag (username#discrim)
        if (!user) user = bans.find(ban => `${ban.user.username}#${ban.user.discriminator}` === args[0]);

        if (!user) return message.reply("Utilisateur non trouvé dans la liste des bannis.");
        await message.guild.members.unban(user.user.id);
        await message.channel.send(`${user.user.username} a été débanni.`);
    }
};