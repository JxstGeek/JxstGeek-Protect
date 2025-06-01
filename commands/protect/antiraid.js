let antiraidEnabled = false;

export default {
    name: "antiraid",
    description: "Active ou désactive l’anti-raid. `+antiraid [on/off]`",
    async execute(message, args, client, config) {
        if (!message.member.roles.cache.some(r => config.adminRoles.includes(r.id))) {
            await message.reply("Tu n'as pas la permission d'utiliser cette commande.");
            return;
        }
        if (!args[0] || !["on", "off"].includes(args[0])) {
            return message.reply("Utilisation : +antiraid [on/off]");
        }
        antiraidEnabled = args[0] === "on";
        await message.channel.send(`Antiraid ${antiraidEnabled ? "activé" : "désactivé"}.`);
    }
};