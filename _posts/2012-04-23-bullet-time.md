---
title:  Ludum Dare 23 - Bullet Time
date:   2012-04-23
tags:   ludumdare
---

With my jumping bug put to rest, on to shooting things! With this, I got my first amusing bug (aside from that brief time I had people jumping off the screen)

Shoot to the right, all is well. Shoot to the left, though, and you hit yourself before quickly launching yourself off the screen.

![](/images/2012-04-23-bullet.png)

Suicidal tendencies aside, this has revealed a few issues in my program. I almost certainly have some disconnects between the box models of my physics model of the world, and the display thereof. That bullet *shouldn’t* be so high on the player model (people don’t generally fire guns by holding them at face-level, as far as I know)

One of the fun parts of using decoupled libraries for display vs physics. 