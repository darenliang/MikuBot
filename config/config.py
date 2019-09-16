"""Config file with important setup variables"""

# default prefix
prefix = '!'

# default presence (DO NOT CHANGE, EXPERIMENTAL)
anime_presence = False

# list of activated extensions
# dbl will be deactivated if bot is set to public
activated_extensions = ['admin', 'pic', 'fun', 'help', 'gaming', 'info', 'mal', 'music', 'reddit', 'utility', 'dbl']

# True for downloading music and False for streaming music
on_download = False

# default embed color
embed_color = 0x2e98a6

# pastebin whatsnew link
whatsnew = 'https://pastebin.com/raw/BZyJcMUi'

# timeout in seconds for selection commands
timeout = 60.0

# True for using a local json database for prefix management. False for using AWS DynamoDB
local_database = False

# sets location of the local json database location if local_database config is set to True
local_database_location = "database/db.json"


class Aws:
    """AWS database setup info"""
    aws_region = 'us-east-1'
    aws_table = 'server_data'


# lenny data
lenny = [
    "ʘ‿ʘ", "ಠ_ಠ", "(╯°□°）╯︵ ┻━┻", "┬─┬﻿ ノ( ゜-゜ノ)", "┬─┬⃰͡ (ᵔᵕᵔ͜ )",
    "┻━┻ ︵ヽ(`Д´)ﾉ︵﻿ ┻━┻", "ლ(｀ー´ლ)", "ʕ•ᴥ•ʔ", "ʕᵔᴥᵔʔ", "ʕ •`ᴥ•´ʔ", "(｡◕‿◕｡)",
    "（　ﾟДﾟ）", "¯\_(ツ)_/¯", "¯\(°_o)/¯", "(`･ω･´)", "(╬ ಠ益ಠ)", "☜(⌒▽⌒)☞",
    "ε=ε=ε=┌(;*´Д`)ﾉ", "ヽ(´▽`)/", "ヽ(´ー｀)ノ", "ᵒᴥᵒ#", "V•ᴥ•V", "ฅ^•ﻌ•^ฅ",
    "（ ^_^）o自自o（^_^ ）", "ಠ‿ಠ", "( ͡° ͜ʖ ͡°)", "ಥ_ಥ", "ಥ﹏ಥ", "٩◔̯◔۶",
    "ᕙ(⇀‸↼‶)ᕗ", "ᕦ(ò_óˇ)ᕤ", "⊂(◉‿◉)つ", "q(❂‿❂)p", "⊙﹏⊙", "¯\_(⊙︿⊙)_/¯", "°‿‿°",
    "¿ⓧ_ⓧﮌ", "(⊙.☉)7", "(´･_･`)", "щ（ﾟДﾟщ）", "٩(๏_๏)۶", "ఠ_ఠ", "ᕕ( ᐛ )ᕗ",
    "(⊙_◎)", "ミ●﹏☉ミ", "༼∵༽ ༼⍨༽ ༼⍢༽ ༼⍤༽", "ヽ༼ ಠ益ಠ ༽ﾉ", "t(-_-t)", "(ಥ⌣ಥ)",
    "(づ￣ ³￣)づ", "(づ｡◕‿‿◕｡)づ", "(ノಠ ∩ಠ)ノ彡( \o°o)\\", "｡ﾟ( ﾟஇ‸இﾟ)ﾟ｡",
    "༼ ༎ຶ ෴ ༎ຶ༽", "“ヽ(´▽｀)ノ”", "┌(ㆆ㉨ㆆ)ʃ", "눈_눈", "( ఠൠఠ )ﾉ", "乁( ◔ ౪◔)「",
    "┑(￣Д ￣)┍", "(๑•́ ₃ •̀๑)", "⁽⁽ଘ( ˊᵕˋ )ଓ⁾⁾", "◔_◔", "♥‿♥", "ԅ(≖‿≖ԅ)",
    "( ˘ ³˘)♥ ", "( ˇ෴ˇ )", "ヾ(-_- )ゞ", "♪♪ ヽ(ˇ∀ˇ )ゞ", "ヾ(´〇`)ﾉ♪♪♪",
    "ʕ •́؈•̀ ₎", "ʕ •́؈•̀)", "ლ(•́•́ლ)", "(ง'̀-'́)ง", "◖ᵔᴥᵔ◗ ♪ ♫ ", "{•̃_•̃}",
    "(ᵔᴥᵔ)", "(Ծ‸ Ծ)", "(•̀ᴗ•́)و ̑̑", "[¬º-°]¬", "(☞ﾟヮﾟ)☞", "''⌐(ಠ۾ಠ)¬'''",
    "(っ•́｡•́)♪♬", "(҂◡_◡)", "ƪ(ړײ)‎ƪ​​", "⥀.⥀", "ح˚௰˚づ ", "♨_♨", "(._.)",
    "(⊃｡•́‿•̀｡)⊃", "(∩｀-´)⊃━☆ﾟ.*･｡ﾟ", "(っ˘ڡ˘ς)", "( ఠ ͟ʖ ఠ)", "( ͡ಠ ʖ̯ ͡ಠ)",
    "( ಠ ʖ̯ ಠ)", "(งツ)ว", "(◠﹏◠)", "(ᵟຶ︵ ᵟຶ)", "(っ▀¯▀)つ", "ʚ(•｀", "(´ж｀ς)",
    "(° ͜ʖ͡°)╭∩╮", "ʕʘ̅͜ʘ̅ʔ", "ح(•̀ж•́)ง † ", "-`ღ´-", "(⩾﹏⩽)", "ヽ( •_)ᕗ",
    "~(^-^)~", "\(ᵔᵕᵔ)/"]
