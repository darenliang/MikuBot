"""This cog file contains the bot's booru commands"""

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

    @commands.command(name='pic', aliases=['pics'])
    async def pic(self, ctx, tag=None):
        """Return a SFW image given a tag.

        Parameters
        ------------
        tag: str [Optional]
            The image tag to search for.
            If an image tag is not specified, the tag "1girl" will be used instead.
        """
        if tag is None:
            tag = '1girl'
        try:
            image = self.get_image(tag + ' score:>10 rating:safe')
        except Exception as e:
            log.error(e)
            try:
                image = self.get_image(tag + ' rating:safe')
            except Exception as e:
                log.warning('pic: Cannot get tag data')
                log.error(e)
                return await ctx.send("Cannot get an image looking for.")
        embed = create_embed(image, tag)
        await ctx.send(embed=embed)

    @commands.command(name='lewd', aliases=['lewds'])
    @commands.is_nsfw()
    async def lewd(self, ctx, tag=None):
        """Return a lewd image given a tag.

        Note:
            Only works for NSFW channels and DMs.

        Parameters
        ------------
        tag: str [Optional]
            The image tag to search for.
            If an image tag is not specified, the tag "1girl" will be used instead.
        """
        if tag is None:
            tag = '1girl'
        try:
            image = self.get_image(tag + ' rating:explicit')
        except Exception as e:
            log.warning('lewd: Cannot get tag data')
            log.error(e)
            return await ctx.send("Cannot get an image looking for.")
        embed = create_embed(image, tag)
        await ctx.send(embed=embed)


def setup(client):
    client.add_cog(Pic(client))
