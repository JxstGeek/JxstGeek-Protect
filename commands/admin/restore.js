import fs from "fs";
import path from "path";

export default {
    name: "restore",
    description: "Restaure la config du serveur depuis une sauvegarde fournie (ATTENTION : action destructive)",
    async execute(message, args, client, config) {
        if (!message.member.roles.cache.some(r => config.adminRoles.includes(r.id))) {
            await message.reply("Tu n'as pas la permission d'utiliser cette commande.");
            return;
        }
        if (!message.attachments.size) return message.reply("Envoie le fichier de backup en pièce jointe.");
        const file = message.attachments.first();
        const res = await fetch(file.url);
        const data = await res.json();
        // Pour la démo, on ne fait que créer les salons. (Attention : la restauration réelle écraserait tout)
        for (const channel of data.channels) {
            await message.guild.channels.create({
                name: channel.name,
                type: channel.type,
                parent: channel.parent,
                position: channel.position,
                rateLimitPerUser: channel.rateLimitPerUser,
                topic: channel.topic
            });
        }
        await message.reply("Restauration partielle terminée ! (Cette commande est à adapter pour restaurer tout le serveur.)");
    }
};