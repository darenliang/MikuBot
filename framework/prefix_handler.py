from discord.ext import commands

from config import config
from framework import dynamodb


def get_prefix(client, message):
    """Get the correct prefix to use"""
    if not message.guild:
        return config.prefix
    prefix = return_prefix(message)
    return commands.when_mentioned_or(prefix)(client, message)


def return_prefix(ctx):
    """Return the correct prefix to use given the context"""
    if not ctx.guild:
        return config.prefix
    for guild in dynamodb.temp:
        if guild['Guild_Id'] == ctx.guild.id:
            return guild['Prefix']
