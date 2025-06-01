export default {
    name: "slowmode",
    description: "Définit un slowmode sur le salon. `+slowmode [secondes]`",
    async execute(message, args, client, config) {
        if (!message.member.roles.cache.some(r => config.adminRoles.includes(r.id))) {
            await message.reply("Tu n'as pas la permission d'utiliser cette commande.");
            return;
        }
        const seconds = parseInt(args[0]);
        if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
            return message.reply("Merci d’indiquer un nombre de secondes valide (0 à 21600).");
        }
        await message.channel.setRateLimitPerUser(seconds);
        await message.channel.send(`⏳ Slowmode défini à ${seconds} secondes.`);
    }
};