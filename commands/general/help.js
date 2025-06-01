import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import config from "../../config.js";

export default {
    name: "help",
    description: "Affiche l'aide du bot avec navigation par catégories.",
    async execute(message, args, client, config) {
        const commandsDir = path.join(process.cwd(), "commands");

        // Liste les catégories (dossiers)
        const categories = fs.readdirSync(commandsDir).filter(file =>
            fs.statSync(path.join(commandsDir, file)).isDirectory()
        );

        // Récupère dynamiquement toutes les commandes par catégorie
        const pages = [];
        for (const category of categories) {
            const commandsPath = path.join(commandsDir, category);
            const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

            // Charge chaque commande dynamiquement avec import()
            const cmds = [];
            for (const file of files) {
                try {
                    const modulePath = pathToFileURL(path.join(commandsPath, file)).href;
                    const cmdModule = await import(modulePath);
                    const cmdExport = cmdModule.default || cmdModule;
                    const name = cmdExport.name || file.replace(".js", "");
                    const desc = cmdExport.description || "*Pas de description*";
                    cmds.push(`\`${config.prefix || "+"}${name}\` : ${desc}`);
                } catch (err) {
                    cmds.push(`\`${file.replace(".js", "")}\` : *Erreur de chargement*`);
                }
            }

            pages.push({
                name: category.charAt(0).toUpperCase() + category.slice(1),
                value: cmds.length ? cmds.join("\n") : "_Aucune commande dans cette catégorie_"
            });
        }

        // Génère un embed pour une page donnée
        const getEmbed = (pageIndex) => {
            const page = pages[pageIndex];
            return new EmbedBuilder()
                .setTitle(`Aide du bot - Catégorie : ${page.name}`)
                .setDescription(page.value)
                .setFooter({ text: `Page ${pageIndex + 1}/${pages.length}` })
                .setColor(config.embedColor);
        };

        // Génère les boutons
        const getButtons = (current) => (
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("⬅️ Précédent")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(current === 0),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("Suivant ➡️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(current === pages.length - 1)
            )
        );

        let pageIndex = 0;
        const embed = getEmbed(pageIndex);
        const buttons = getButtons(pageIndex);

        // Envoie l'embed avec les boutons
        const sent = await message.reply({ embeds: [embed], components: [buttons] });

        // Collector pour la pagination
        const collector = sent.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 60000
        });

        collector.on("collect", async i => {
            if (i.customId === "prev" && pageIndex > 0) pageIndex--;
            else if (i.customId === "next" && pageIndex < pages.length - 1) pageIndex++;
            await i.update({ embeds: [getEmbed(pageIndex)], components: [getButtons(pageIndex)] });
        });

        collector.on("end", async () => {
            await sent.edit({ components: [getButtons(pageIndex).setComponents(
                ...getButtons(pageIndex).components.map(btn => btn.setDisabled(true))
            )] });
        });
    }
};