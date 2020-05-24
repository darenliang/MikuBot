"""This framework file contains the bot's prefix handling"""

from discord.ext import commands

from config import config


def get_prefix(client, message):
    """Get the correct prefix to use"""
    if not message.guild:
        return config.prefix
    prefix = return_prefix(client, message)
    return commands.when_mentioned_or(prefix)(client, message)


def return_prefix(client, ctx):
    """Return the correct prefix to use given the context"""
    if not ctx.guild:
        return config.prefix
    return client.database.temp[str(ctx.guild.id)]
