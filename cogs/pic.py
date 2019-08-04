import logging
import os.path

import discord
from discord.ext import commands
from pybooru import Danbooru

from config import config

# set logger
log = logging.getLogger(__name__)


def create_embed(image, query):
    """Generate embed for pic commands"""
    embed = discord.Embed(
        color=config.embed_color,
        title=os.path.basename(image),
        description='Here is your daily dose of {0}'.format(query)
    )
    embed.set_image(url=image)
    return embed


class Pic(commands.Cog):
    """Pic command group."""

    def __init__(self, client):
        self.client = client

        # creates danbooru instance
        self.booru = Danbooru('danbooru')

    def get_image(self, tag):
        """Get image based on tag"""
        return self.booru.post_list(limit=1, tags=tag, random=True, raw=True)[0]['file_url']


def setup(client):
    client.add_cog(Pic(client))
