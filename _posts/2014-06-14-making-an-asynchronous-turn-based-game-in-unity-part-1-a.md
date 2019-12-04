---
title:  Making an Asynchronous Turn-based Game in Unity, Part I-A
date:   2014-06-14
tags:   unity3d
---

The nice thing about working with a bunch of friendly and clever folk at [Braintree](https://www.braintreepayments.com/careers) is that they are always willing to brainstorm on better ways of building software. "Clans" is no exception, and within 20 minutes of posting [Part I](/making-an-asynchronous-turn-based-game-in-unity-part-1/) we[^1] had come up with a simpler way to build it.

### In our last thrilling installment…
I left off in Part I talking about running Unity on the server. It consisted of two parts:

1. Clients (our players) submit _orders_ to the server that represent what they wanted to do on their turn.
2. When the server has all orders for all players, it processes those orders on the server and sends back to clients the new _game state_ that results from it.

Turns out that Step #2 is overkill[^2]. Instead, once we have all players' orders, we just have to send back to each client that collection of all players' orders and let each client simulate what happened. As long as the simulation is deterministic, clients should end up with the same game state that the server would have generated. This avoids any kind of Unity/Mono running on the server at all.

This introduces the possibility of clients accidentally generating different ideas of the "current state" of the game and getting out-of-sync from one another. This is hardly a novel problem or indeed solution. The original Warcraft used a similar scheme in multiplayer albeit to solve very different problems than what I'm solving. There is [a fascinating analysis of the Warcraft out-of-sync problem and its solution by one of Warcraft's creators, Patrick Wyatt](http://www.codeofhonor.com/blog/the-making-of-warcraft-part-3). 

My solution will be a slight variation on the first step above. When clients send the server their orders, they'll also send their understanding of the current game state. Specifically, each client will serialize the current state of the game as they understand it and produce an MD5 sum of the result. If any client sends an MD5 sum that differs from the others, the game is out-of-sync and is dealt with[^3].

### The New Plan [^4]

1. Clients (our players) submit _orders_ to the server that represent what they want to do on their turn. In addition they submit an MD5 checksum of the current game state.
2. When the server has all orders for all players, it verifies all clients had the same game state. It then sends back to clients all other clients' orders.
3. Each client verifies and simulates orders on their own to determine the next game state.

### Next Time, on "Clans!"

Scott outlines how the server will work, something he promised to do in Part I! Enriquela discovers a terrible secret about sharks! Captain Boontz makes a decision that will change OMEGA GOGO SQUADRON _forever_.

TUNE IN NEXT TIME!

SP


[^1]: Credit specifically goes to [Michael Fairley](http://m12y.com/) who did the lion's share of the critical thinking so I didn't have to.

[^2]: The server-side simulation approach has a couple of advantages still. In particular, it's rather hard to cheat in that scenario. While "Clans" won't have much hidden information, it will have _some_. A technically skilled cheater could reverse-engineer the client to provide omniscience within the state of the game. If Clans is popular enough to have that problem, I will be only too happy to revisit this scheme to simulate the game server-side and send partial state to clients.

[^3]: "Dealt with" is a euphemism for "game over." This won't be a Civilization-style game where someone would lose 30 hours of gameplay if a game terminates. Additionally, this should be an extremely rare occurrence. You could send out the previous game state and keep the game "paused" until you get consistent states back from all clients, but I don't care enough about this problem to bother.

[^4]: Until my clever coworkers come up with something else, that is.