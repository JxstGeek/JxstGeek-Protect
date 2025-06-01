export default {
    name: "kick",
    description: "Kick un membre. `+kick @membre [raison]`",
    async execute(message, args, client, config) {
        if (!message.member.roles.cache.some(r => config.adminRoles.includes(r.id))) {
            await message.reply("Tu n'as pas la permission d'utiliser cette commande.");
            return;
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply("Mentionne un membre à kick.");
        const reason = args.slice(1).join(" ") || "Aucune raison fournie";
        try {
            await member.kick(reason);
            await message.channel.send(`${member.user.username} a été kick. Raison : ${reason}`);
        } catch (err) {
            await message.reply("Impossible de kick ce membre.");
        }
    }
};