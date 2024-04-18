import { exec } from "child_process";
import { Channel, ChannelType, Client, EmbedBuilder, GatewayIntentBits, Guild } from "discord.js";
import { convert } from "./speedtest";
import schedule from "node-schedule";
import "dotenv/config";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("ready", async () => {
    console.log("Bot is ready!");
    const guild = client.guilds.cache.find((guild) => guild.id === process.env.DISCORD_GUILD_ID);
    const channel = guild?.channels.cache.find((channel) => channel.id === process.env.DISCORD_CHANNEL_ID);
    sendResult(channel);
    schedule.scheduleJob("0,15,30,45 * * * *", () => {
        sendResult(channel);
    });
});

const sendResult = (channel: Channel | undefined) => {
    console.log("Measuring...")
    
    exec("speedtest -s 48463", async (err, stdout, stderr) => {
        if (err) console.log(err);
        console.log(stdout);
        const cleanedData = stdout.replaceAll(" ", "").split("\n").map(item => item.trim().replace('\r', ''));
        const convertedData = convert(cleanedData.splice(3));
        console.log("Result: ")
        console.log(JSON.stringify(convertedData));
        if (channel?.type === ChannelType.GuildText) {
            const embeds = new EmbedBuilder()
            .setTitle("Speedtest Result")
            .setURL(String(convertedData.ResultURL))
            .setDescription(convertedData.Server?.name || "null")
            .setTimestamp()
            .addFields(
                { name: "Download", value: convertedData.Download?.speed || "null", inline: true },
                { name: "Upload", value: convertedData.Upload?.speed || "null", inline: true },
            ).addFields(
                { name: "Download", value: convertedData.Download?.Ping.jitter || "null" },
                { name: "Upload", value: convertedData.Upload?.Ping.jitter || "null", inline: true },
            ).addFields(
                { name: "Packet Loss", value: String(convertedData.PacketLoss) || "null" }
            ).setImage("https://play-lh.googleusercontent.com/xKUdbWyGGv4lbYH5Fzrz-USBEKk84Aw43IPmnl9VVq4jewz4y8JrwOivPsAYCtTbDbdt");
            await channel.send({ embeds: [embeds] });
        }
    });
};

client.login(process.env.DISCORD_BOT_TOKEN);