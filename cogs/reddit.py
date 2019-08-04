import os
from random import randint

import discord
import praw
from discord.ext import commands

from config import config


def create_embed(submission):
    """Generate embed for reddit commands"""
    embed = discord.Embed(
        color=config.embed_color,
        title=os.path.basename(submission.url),
        description='r/' + submission.subreddit.display_name + '\n\n' + submission.title
    )
    embed.set_image(url=submission.url)
    return embed


class Reddit(commands.Cog):
    """Reddit command group."""

    def __init__(self, client):
        self.client = client

        # creates reddit instance
        self.reddit = praw.Reddit(client_id=os.environ['REDDIT_ID'], client_secret=os.environ['REDDIT_SECRET'],
                                  user_agent=os.environ['REDDIT_USERAGENT'])

    def get_submission(self, subreddit):
        """Get reddit submissions given a subreddit"""
        counter = 0
        submissions = [x for x in self.reddit.subreddit(subreddit).hot(limit=150) if not x.stickied and x.url]
        limit = randint(0, len(submissions) - 1)
        for submission in submissions:
            if counter == limit:
                return submission
            else:
                counter += 1

    @commands.command(name='animemes', aliases=['animeme', 'meme', 'memes'])
    async def animemes(self, ctx):
        """Return a random r/animemes post."""
        submission = self.get_submission('animemes')
        await ctx.send(embed=create_embed(submission))

    @commands.command(name='headpats', aliases=['headpat', 'pat', 'pats'])
    async def headpats(self, ctx):
        """Return a random r/headpats post."""
        submission = self.get_submission('headpats')
        await ctx.send(embed=create_embed(submission))

    @commands.command(name='pouts', aliases=['pout'])
    async def pouts(self, ctx):
        """Return a random r/pouts post."""
        submission = self.get_submission('pouts')
        await ctx.send(embed=create_embed(submission))

    @commands.command(name='awwnime', aliases=['aww'])
    async def awwnime(self, ctx):
        """Return a random r/awwnime post."""
        submission = self.get_submission('awwnime')
        await ctx.send(embed=create_embed(submission))

    @commands.command(name='anime_irl', aliases=['irl'])
    async def anime_irl(self, ctx):
        """Return a random r/anime_irl post."""
        submission = self.get_submission('anime_irl')
        await ctx.send(embed=create_embed(submission))

    @commands.command(name='showerthoughts', aliases=['showerthought', 'thought'])
    async def showerthoughts(self, ctx):
        """Return a random r/showerthoughts post."""
        submission = self.get_submission('showerthoughts')
        showerthought = submission.title
        if submission.selftext is not None:
            showerthought += "\n\n" + submission.selftext
        await ctx.send(showerthought)


def setup(client):
    client.add_cog(Reddit(client))
