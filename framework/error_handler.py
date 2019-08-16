"""This framework file contains the bot's error handling"""

import sys
import traceback

from discord.ext import commands


class CommandErrorHandler(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_command_error(self, ctx, error):
        """The event triggered when an error is raised while invoking a command.
        ctx   : Context
        error : Exception"""

        if hasattr(ctx.command, 'on_error'):
            return

        ignored = commands.CommandNotFound
        error = getattr(error, 'original', error)

        if isinstance(error, ignored):
            return

        # disabled command
        elif isinstance(error, commands.DisabledCommand):
            return await ctx.send(f'The command `{ctx.command}` has been disabled.')

        # conversion error
        elif isinstance(error, commands.ConversionError):
            return await ctx.send(f'The command `{ctx.command}` encountered a conversion error.')

        # bad argument
        elif isinstance(error, commands.BadArgument):
            return await ctx.send(f'The command `{ctx.command}` encountered a bad argument.')

        # missing required argument
        elif isinstance(error, commands.MissingRequiredArgument):
            return await ctx.send(f'The command `{ctx.command}` is missing a required argument.')

        # parsing error
        elif isinstance(error, commands.ArgumentParsingError):
            return await ctx.send(f'The command `{ctx.command}` encountered a parsing error.')

        # missing permissions
        elif isinstance(error, commands.MissingPermissions):
            return await ctx.send(f'You are missing the required permissions to run the `{ctx.command}` command.')

        # NSFW channel required
        elif isinstance(error, commands.NSFWChannelRequired):
            return await ctx.send(f'The command `{ctx.command}` can only be used on a NSFW channel.')

        # no private messages
        elif isinstance(error, commands.NoPrivateMessage):
            try:
                return await ctx.author.send(
                    f'The command `{ctx.command}` can not be used in private messages and can only be used in a guild.')
            except:
                pass

        # other
        elif isinstance(error, commands.BadArgument):
            if ctx.command.qualified_name == 'tag list':
                return await ctx.send('I could not find that member. Please try again.')

        print('Ignoring exception in command {}:'.format(ctx.command), file=sys.stderr)
        traceback.print_exception(type(error), error, error.__traceback__, file=sys.stderr)


def setup(bot):
    bot.add_cog(CommandErrorHandler(bot))
