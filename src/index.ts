import { exec } from "child_process";
import { Channel, ChannelType, Client, GatewayIntentBits, Guild } from "discord.js";
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
        const cleanedData = stdout.replaceAll(" ", "").split("\n").map(item => item.trim().replace('\r', ''));
        const convertedData = convert(cleanedData.splice(3));
        console.log("Result: ")
        console.log(JSON.stringify(convertedData));
        if (channel?.type === ChannelType.GuildText) {
            await channel.send(String(convertedData.ResultURL));
        }
    });
};

client.login(process.env.DISCORD_BOT_TOKEN);