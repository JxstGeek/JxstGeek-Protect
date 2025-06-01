import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export default {
    name: "ticket-transcript",
    description: "Transcrit les messages d’un salon de ticket. `+transcript [#ticket]`",
    async execute(message, args, client, config) {
        if (!message.member.roles.cache.some(r => config.adminRoles.includes(r.id))) {
            await message.reply("Tu n'as pas la permission d'utiliser cette commande.");
            return;
        }
        const channel = message.mentions.channels.first() || message.channel;
        if (!channel.name.startsWith("ticket-")) {
            return message.reply("Ce salon n'est pas un ticket.");
        }
        const messages = await channel.messages.fetch({ limit: 100 });
        const content = [...messages.values()]
            .reverse()
            .map(m => `[${m.createdAt.toLocaleString()}] ${m.author.username} : ${m.content}`)
            .join("\n");
        const filePath = path.join(process.cwd(), `transcript-${channel.id}.txt`);
        fs.writeFileSync(filePath, content);
        await message.author.send({ files: [filePath] });
        await message.reply("Transcript envoyé en privé.");
        fs.unlinkSync(filePath);
    }
};