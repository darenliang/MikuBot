"""This cog file overrides some of the defaults of the help command"""

import itertools

from discord.ext import commands


class HelpCommand(commands.DefaultHelpCommand):
    def __init__(self):
        super().__init__()
        self.verify_checks = True

    async def send_pages(self):
        """A helper utility to send the page output from :attr:`paginator` to the destination."""
        destination = self.context.author
        # destination = self.get_destination()
        for page in self.paginator.pages:
            await destination.send(page)
        if self.context.guild:
            await self.context.send('Message sent to your DMs!')

    async def send_bot_help(self, mapping):
        """Generates bot help pages"""
        ctx = self.context
        bot = ctx.bot

        if bot.description:
            # <description> portion
            self.paginator.add_line(bot.description, empty=True)

        no_category = '\u200b{0.no_category}:'.format(self)

        def get_category(command, *, no_cat=no_category):
            cog = command.cog
            return cog.qualified_name + ':' if cog is not None else no_cat

        filtered = await self.filter_commands(bot.commands, sort=True, key=get_category)
        max_size = self.get_max_size(filtered)
        to_iterate = itertools.groupby(filtered, key=get_category)

        note = self.get_ending_note()
        if note:
            self.paginator.add_line(note)
        self.paginator.add_line()

        # Now we can add the commands to the page.
        for cat, cmds in to_iterate:
            cmds = sorted(cmds, key=lambda c: c.name) if self.sort_commands else list(cmds)
            self.add_indented_commands(cmds, heading=cat, max_size=max_size)

        await self.send_pages()


class Help(commands.Cog):
    """Help command group."""

    def __init__(self, bot):
        self.bot = bot
        self._original_help_command = self.bot.help_command
        self.bot.help_command = HelpCommand()
        self.bot.help_command.cog = self

    def cog_unload(self):
        self.bot.help_command = self._original_help_command


def setup(client):
    client.add_cog(Help(client))
