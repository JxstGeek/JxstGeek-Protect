export default {
    name: "clear",
    description: "Supprime un certain nombre de messages. Utilisation : `+clear [nombre] ou +clear [@membre] [nombre]`",
    async execute(message, args, client, config) {
        // Permission : admin uniquement
        if (!message.member.roles.cache.some(r => config.adminRoles.includes(r.id))) {
            await message.reply("Tu n'as pas la permission d'utiliser cette commande.");
            return;
        }

        let target;
        let amount = 0;

        // +clear [nombre]
        if (args.length === 1 && !message.mentions.members.size) {
            amount = parseInt(args[0]);
            if (isNaN(amount) || amount < 1 || amount > 100) {
                return message.reply("Merci d’indiquer un nombre entre 1 et 100.");
            }
            await message.channel.bulkDelete(amount+1, true);
            return message.channel.send(`🧹 ${amount} messages supprimés.`).then(msg => setTimeout(() => msg.delete(), 3000));
        }

        // +clear [@membre] [nombre]
        if (args.length === 2 && message.mentions.members.size) {
            target = message.mentions.members.first();
            amount = parseInt(args[1]);
            if (isNaN(amount) || amount < 1 || amount > 100) {
                return message.reply("Merci d’indiquer un nombre entre 1 et 100.");
            }
            const messages = await message.channel.messages.fetch({ limit: 100 });
            const toDelete = messages.filter(msg => msg.author.id === target.id).first(amount);
            if (toDelete.length === 0) {
                return message.reply(`Aucun message trouvé de ${target}.`);
            }
            await message.channel.bulkDelete(toDelete, true);
            return message.channel.send(`🧹 ${toDelete.length} messages de ${target} supprimés.`).then(msg => setTimeout(() => msg.delete(), 3000));
        }

        return message.reply("Utilisation : +clear [nombre] ou +clear [@membre] [nombre]");
    }
};