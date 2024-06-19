import { Client, REST, Routes } from "discord.js";
import { DISCORD_CLIENT_ID, DISCORD_TOKEN } from "./config";
import { getCommands } from "./commands";

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

export const syncGuildCommands = async (guildId: string) => {
  const commands = getCommands();

  const commandsJSON = await Promise.all(
    commands.map((command) =>
      command.buildCommand().then((builder) => builder.toJSON())
    )
  );

  try {
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, guildId),
      {
        body: commandsJSON,
      }
    );
    console.log(
      `Successfully registered application commands for guild: ${guildId}.`
    );
  } catch (error) {
    console.error(
      `Failed to register application commands for guild: ${guildId}.`
    );
    console.error(`Error: ${error}`);
    if (error instanceof Error && "rawError" in error) {
      const discordError = error as any;
      console.error(
        `Raw Error: ${JSON.stringify(discordError.rawError, null, 2)}`
      );
    }
  }
};

export const syncAllGuildsCommands = async (client: Client) => {
  for (const guild of client.guilds.cache.map((g) => g)) {
    await syncGuildCommands(guild.id);
  }
};
