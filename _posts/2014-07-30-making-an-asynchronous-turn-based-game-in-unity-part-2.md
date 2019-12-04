---
title:  Making an Asynchronous Turn-based Game in Unity, Part II
date:   2014-07-30
tags:   unity3d
---

![](/images/2014-07-30-screen-1.png)

Now that I have a basic prototype that adheres to [the plan outlined in Part I-A](/making-an-asynchronous-turn-based-game-in-unity-part-1-a), it's time to build a server to support this game.

A longstanding (and totally hilarious) joke of mine is that I'll play any game with a "Next Turn" button. As such, I plan to build a server that can support not just Clans but any future turn-based strategy games I build. Ideally I'd even love to open-source the server portion and allow other, less technical developers to start making this kind of game so that I can start playing them. =)

As such, here are my design goals for this:

1. Support multiple different "Games"
2. Support multiple users
3. Support users having multiple "sessions" in multiple "games" (a session is basically an instance of a game. In other words, "Clans" would be the game while my 1v1 game against Gourmand would be a "session")
4. Support asynchronous chat within a session

So then, architecture: I initially plan to build this out as a [rails-api](https://github.com/rails-api/rails-api) application that primarily exists to persist game and chat state. The server will authenticate users and apps via OAuth2 password grants with each game as a different client.

While I'd be tempted to store game states on disk, serializing them to Postgres is the easiest solution for now since I plan to deploy to Heroku. I reserve the right to introduce a more sensible document store down the road however.

I haven't found a way to incorporate Redis into this solution yet so let's fix that. I'll probably use it to store in-game chats as sorted sets per-user. Initially chat will only be global within a session so chats per-user is overkill. Eventually I'd love to support user-to-user chat as well though. Even if this turns out to be YAGNI[^1], it will be YAGNIBIIF?[^2]

## Next Time on the Making of "Clans"

This wraps up most of my planning materials. Once I have a Trello board for Clans, I'll add a link to it here. (edit: [here is that Trello board](https://trello.com/b/2DsnBsDh/gamestack))

Next up, I'll share what are becoming my current "best practices" for code organization in Unity. This has long been a sticking point for me as projects grow, but I've come across a style that seems to be the least painful.

[^1]: You Ain't Gonna Need It, http://en.wikipedia.org/wiki/You_aren't_gonna_need_it (ignore anyone who says that stands for aren't, by the way)
[^2]: You Ain't Gonna Need It, But Isn't It Fun? (citation needed)