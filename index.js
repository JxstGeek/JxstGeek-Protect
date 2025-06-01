import { Client, IntentsBitField, Collection } from "discord.js";
import config from "./config.js";
import interactionHandler from "./commands/events/interactionCreate.js";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers
    ]
});

client.commands = new Collection();

// Chargement dynamique des commandes (récursif)
async function loadCommands(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            await loadCommands(fullPath);
        } else if (file.endsWith('.js')) {
            const command = await import(pathToFileURL(fullPath).href);
            client.commands.set(command.default.name, command.default);
        }
    }
}
await loadCommands(path.join(__dirname, 'commands'));

client.on('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.username}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Protections dynamiques
    if (config.antiSpam) {
        const antispam = (await import(pathToFileURL(path.join(__dirname, './commands/protect/antispam.js')).href)).default;
        await antispam.execute(message, [], client, config);
    }
    if (config.antiLink) {
        const antilink = (await import(pathToFileURL(path.join(__dirname, './commands/protect/antilink.js')).href)).default;
        await antilink.execute(message, [], client, config);
    }

    if (!message.content.startsWith(config.prefix)) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) return;
    try {
        await command.execute(message, args, client, config);
    } catch (error) {
        console.error(error);
        message.reply("Une erreur est survenue lors de l'exécution de la commande.");
    }
});

client.on("interactionCreate", (interaction) => interactionHandler(client, interaction));

client.login(config.token);