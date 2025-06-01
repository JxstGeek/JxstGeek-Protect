import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import config from "../../config.js";

async function generateTranscript(channel) {
  const messages = await channel.messages.fetch({ limit: 100 });
  const sorted = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
  let content = `Transcript du salon #${channel.name}\n\n`;
  for (const msg of sorted.values()) {
    const time = msg.createdAt.toLocaleString();
    const author = msg.member?.displayName || msg.author.username;
    content += `[${time}] ${author} (${msg.author.id}): ${msg.cleanContent}\n`;
  }
  return Buffer.from(content, "utf-8");
}

export default async function logTicket(channel, closedByUser, client, options = {}) {
  try {
    let openedByUserId = channel.topic?.match(/\d{17,}/)?.[0];
    if (!openedByUserId && channel.name.startsWith("ticket-")) {
      openedByUserId = channel.name.split("-").pop();
    }
    let openedByUser = null;
    let openedByMember = null;
    if (openedByUserId) {
      try { 
        openedByUser = await client.users.fetch(openedByUserId);
        openedByMember = await channel.guild.members.fetch(openedByUserId);
      } catch {}
    }
    let openedAt = channel.createdAt;
    let closedAt = new Date();

    const transcriptBuffer = await generateTranscript(channel);
    const transcriptFile = new AttachmentBuilder(transcriptBuffer, { name: `${channel.name}_transcript.txt` });
    
    // Si onlyDM: ne log PAS dans les logs, ENVOIE SEULEMENT EN DM
    if (options.onlyDM && openedByUser) {
      try {
        await openedByUser.send({
          content: `Voici le transcript de ton ticket **${channel.name}** (généré le <t:${Math.floor(closedAt.getTime()/1000)}:f>)`,
          files: [transcriptFile]
        });
      } catch {}
      return;
    }
    
    const embed = new EmbedBuilder()
      .setTitle("Ticket fermé")
      .setColor(0xe74c3c)
      .setThumbnail(closedByUser.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: "Salon", value: `\`${channel.name}\``, inline: true },
        { name: "Ouvert par", value: openedByUser ? `${openedByMember ? openedByMember.displayName : openedByUser.username} (\`${openedByUser.id}\`)` : "Inconnu", inline: true },
        { name: "Fermé par", value: closedByUser ? `${closedByUser.username} (\`${closedByUser.id}\`)` : "Inconnu", inline: true },
        { name: "\u200B", value: "\u200B", inline: false },
        { name: "Date d'ouverture", value: `<t:${Math.floor(openedAt.getTime()/1000)}:f>`, inline: true },
        { name: "Date de fermeture", value: `<t:${Math.floor(closedAt.getTime()/1000)}:f>`, inline: true }
      )
      .setTimestamp();

    const logChannel = await client.channels.fetch(config.ticketsLogChannelId);
    await logChannel.send({ embeds: [embed], files: [transcriptFile] });

    // Envoie en DM seulement si fermeture finale (pas lors d'un simple transcript)
    if (openedByUser && !options.onlyLog) {
      try {
        await openedByUser.send({
          content: `Voici le transcript de ton ticket **${channel.name}** fermé le <t:${Math.floor(closedAt.getTime()/1000)}:f>`,
          files: [transcriptFile]
        });
      } catch {}
    }
  } catch (err) {
    console.error("Erreur lors du log ticket :", err);
  }
}