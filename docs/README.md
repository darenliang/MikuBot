# Documentation

Welcome to MikuBot's documentation page.

[Invite the bot here](https://discord.com/api/oauth2/authorize?client_id=512354713602228265&permissions=8&scope=bot)

[Source Code](https://github.com/darenliang/MikuBot)

[Support Server](https://discord.gg/Tpa3cJB)

The default prefix is `!` and is configurable via the [`@MikuBot prefix`](#prefix) command. Direct mentions `@MikuBot <command name>` also work.

You use [`@MikuBot help`](#help) to get the server prefix. Alternatively you can use the [`@MikuBot info`](#info) command.

MikuBot is currently in early stages of development. If you have any cool bot command ideas or have feedback, please feel free to DM me at **SirPlumPits#1760**. Thanks!

## Anime Commands

### anime

`anime <anime name>` gets anime info.

### manga

`manga <manga name>` gets manga info.

### musicquiz

`musicquiz` starts an anime music quiz.

`musicquiz <guess>` to guess the anime.

`musicquiz hint` to get hints.

`musicquiz giveup` to giveup.

### leaderboard

`leaderboard` displays your own music quiz score. It also shows your global and server rank.

`leaderboard server <optional page number>` display the anime music quiz leaderboard of your server.

`leaderboard global <optional page number>` display the global anime music quiz leaderboard.

### trivia

`trivia` starts an anime trivia question.

### sauce

`sauce <artwork or screenshot (attachment or url)>` attempts to determine where the image is from.

## Weeb Commands

### waifu

`waifu` returns an AI generated waifu.

### catgirl

`catgirl` returns a random catgirl image.

### headpat

`headpat` returns a random headpat image.

`headpat <user>` headpat user.

### kiss

`kiss` returns a random kiss image.

`kiss <user>` kiss user.

### tickle

`tickle` returns a random tickle image.

`tickle <user>` tickle user.

### feed

`feed` returns a random feed image.

`feed <user>` feed user.

### slap

`slap` returns a random slap image.

`slap <user>` slap user.

### cuddle

`cuddle` returns a random cuddle image.

`cuddle <user>` cuddle with user.

### hug

`hug` returns a random hug image.

`hub <user>` hug user.

### smug

`smug` returns a random smug image.

`smug <user>` smug at user.

### baka

`baka` returns a random baka image.

`baka <user>` call user an idiot.

## Fun Commands

### image

`image` get a random user submitted server image.

`image <url or attachment>` submit images.

`image delete` to get directions on how to delete images.

`image delete <id>` delete image by id.

### snipe

`snipe` shows the last deleted message in the channel.

### owofy

`owofy <message>` owofies a message 😳.

### 8ball

`8ball <question>` to get a response.

### kaomoji

`kaomoji` returns a random kaomoji (づ｡◕‿‿◕｡)づ.

## Music Commands

**Hosting music is resource intensive. If anyone is willing to donate server space to host a music node for the bot, it would mean the world to me.**

### play

`play <url or video name>` to add song to queue and play music.

### skip

`skip` to skip current track.

### pause

`pause` to pause current track.

### resume

`resume` to resume current track.

### stop

`stop` to stop music and leave voice channel.

### queue

`queue <optional page number>` displays current queue.

### nowplaying

`nowplaying` show now playing track.

## Utility Commands

### help

`help` brings up a list of commands.

`help <command name>` gets help for specific command and displays a command's aliases.

### info

`info` gets bot info.

### prefix

`prefix` gets current prefix.

`prefix <prefix>` configures the server prefix.

### translate

`translate <message>` translates message to English.

`translate to:<language> <message>` translates message to specified language.

**Note:**

Please consult [ISO-639-1/2](https://cloud.google.com/translate/docs/languages) for all the language codes.

```
af, am, ar, az, be, bg, bn, bs, ca, ceb, co, cs, cy, da, de, el, en, eo, es, et, 
eu, fa, fi, fr, fy, ga, gd, gl, gu, ha, haw, hi, hmn, hr, ht, hu, hy, id, ig, is, 
it, iw, ja, jw, ka, kk, km, kn, ko, ku, ky, la, lb, lo, lt, lv, ma, mg, mi, mk, 
ml, mn, mr, ms, mt, my, ne, nl, no, ny, pl, ps, pt, ro, ru, sd, si, sk, sl, sm, 
sn, so, sq, sr, st, su, sv, sw, ta, te, tg, th, tl, tr, ug, uk, ur, uz, vi, xh, 
yi, yo, zh-cn, zh-tw, zu
```

### avatar

`avatar` gets your own profile picture.

`avatar <mention|username|nickname|ID>` returns the respective profile picture.

### cloc

`cloc` gets the code line count of this bot.

`cloc <GitHub username / repo name>` gets the code line count of mentioned GitHub repo.

### ping

`ping` pings bot.
