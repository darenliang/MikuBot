"""Config file with important setup variables"""

# default prefix
prefix = '!'

# list of activated extensions
activated_extensions = ['admin', 'music']

# True for downloading music and False for streaming music
on_download = False

# default embed color
embed_color = 0x2e98a6


class Aws:
    """AWS database setup info"""
    aws_region = 'us-east-1'
    aws_table = 'prefix_table'
