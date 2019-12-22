"""
  __  __ _ _        ___      _
 |  \/  (_) |___  _| _ ) ___| |_
 | |\/| | | / / || | _ \/ _ \  _|
 |_|  |_|_|_\_\\_,_|___/\___/\__|

MikuBot is a fast, clean and modular Discord bot written in Python using discord.py

To invite the official MikuBot discord bot, you can do so with this link:
https://discordapp.com/api/oauth2/authorize?client_id=512354713602228265&scope=bot&permissions=0

Copyright (c) 2019 Daren Liang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

import asyncio
import logging
import os
import sys
from datetime import datetime

import discord
from discord.ext import commands

from config import config
from framework import prefix_handler, temp_database, presence, database

# sets up logging
logging.basicConfig(stream=sys.stdout, level=logging.INFO)


class BotClient(commands.AutoShardedBot):
    """Bot class"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # create the background task and run it in the background
        self.bg_task = self.loop.create_task(self.presence_changer())
        self.temp = temp_database.TempDatabase()
        self.database = database.initialize_database()

    async def on_ready(self):
        """Runs on ready"""
        logging.info('Starting up')

        # register guilds in database
        self.database.guild_update(self)
        self.database.temp_update(self)

        logging.info('Guilds registered')
        logging.info('Bot is ready')

        if not config.anime_presence:
            await self.change_presence(activity=discord.Game(name="with weebs"))
            logging.info('Presence changed')

    async def on_guild_join(self, guild):
        """Runs when the bot joins a new server"""

        # add guild to database
        self.database.guild_add(guild)
        self.database.temp_add(guild)
        logging.info('Guild added to database')

    async def on_guild_remove(self, guild):
        """Runs when the bot leaves a server"""

        # remove guild to database
        self.database.guild_remove(guild)
        self.database.temp_remove(guild)
        logging.info('Guild removed in database')

    async def on_guild_update(self, old_guild, new_guild):
        """Runs when a server updates"""

        # update guild info on database
        self.database.guild_change(old_guild, new_guild)
        logging.info('Guild information changed in database')

    async def presence_changer(self):
        """Sets presence to today's airing anime"""
        await self.wait_until_ready()
        while not self.is_closed():
            if config.anime_presence:
                # change watching presence
                await self.change_presence(
                    activity=discord.Activity(type=discord.ActivityType.watching, name=presence.get_presence()))
                logging.info('Presence changed')
            await asyncio.sleep(3600)


if __name__ == "__main__":
    # create autoshardedbot
    client = BotClient(command_prefix=prefix_handler.get_prefix, case_insensitive=True)
    logging.info('Client generated')

    # save launch time when bot starts up
    client.launch_time = datetime.utcnow()
    logging.info('Startup time registered')

    # load extensions to memory
    extensions = config.activated_extensions[:]

    # unload and load cogs according to public_bot status
    if "PUBLIC_BOT" in os.environ:
        if os.environ["PUBLIC_BOT"] == 'true':
            if 'pic' in extensions:
                extensions.remove('pic')
        elif os.environ["PUBLIC_BOT"] == 'false':
            if 'dbl' in extensions:
                extensions.remove('dbl')

    # load cog extensions
    for extension in extensions:
        client.load_extension(f'cogs.{extension}')
    client.load_extension('framework.error_handler')
    logging.info('Extensions loaded')

    # run bot instance
    client.run(os.environ['BOT_TOKEN'], bot=True, reconnect=True)
    logging.info('Bot instance initiated')
