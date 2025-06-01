export default {
    name: "renew",
    description: "Supprime ce salon puis le recrée à l'identique (reset).",
    async execute(message, args, client, config) {
        // Vérifie les permissions
        if (!message.member.permissions.has("ManageChannels")) {
            await message.reply("Tu n'as pas la permission de renouveler ce salon.");
            return;
        }

        const channel = message.channel;
        const channelData = {
            name: channel.name,
            type: channel.type,
            topic: channel.topic,
            nsfw: channel.nsfw,
            parent: channel.parent,
            permissionOverwrites: channel.permissionOverwrites.cache.map(ow => ({
                id: ow.id,
                type: ow.type,
                allow: ow.allow.bitfield.toString(),
                deny: ow.deny.bitfield.toString()
            })),
            position: channel.rawPosition,
            rateLimitPerUser: channel.rateLimitPerUser,
        };

        // Préviens AVANT de supprimer
        await message.reply("Salon en cours de renouvellement...");

        // Supprime le salon
        await channel.delete("Renouvellement du salon");

        // Recrée le salon (dans la même catégorie et position si possible)
        const newChannel = await message.guild.channels.create({
            name: channelData.name,
            type: channelData.type,
            topic: channelData.topic,
            nsfw: channelData.nsfw,
            parent: channelData.parent,
            permissionOverwrites: channelData.permissionOverwrites,
            position: channelData.position,
            rateLimitPerUser: channelData.rateLimitPerUser,
            reason: "Renouvellement du salon"
        });

        // Envoie une confirmation dans le nouveau salon
        await newChannel.send(`Salon renouvelé par <@${message.author.id}> !`);
    }
};