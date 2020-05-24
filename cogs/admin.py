"""This cog file contains the bot's admin commands"""

import logging

from discord.ext import commands

from framework import prefix_handler

# set logger
log = logging.getLogger(__name__)


class Admin(commands.Cog):
    """Admin command group."""

    def __init__(self, client):
        self.client = client

    @commands.command(name='prefix', aliases=['set_prefix'])
    @commands.has_permissions(administrator=True)
    @commands.guild_only()
    async def prefix(self, ctx, *, prefix):
        # set new prefix in temporary local database
        self.client.database.temp[str(ctx.guild.id)] = prefix

        # set prefix_handler
        self.client.command_prefix = prefix_handler.get_prefix


def setup(client):
    client.add_cog(Admin(client))
