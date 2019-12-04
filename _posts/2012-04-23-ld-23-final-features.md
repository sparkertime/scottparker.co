---
title:  Ludum Dare 23 - Final Features
date:   2012-04-23
tags:   ludumdare
---

Rather than worry too much about making something a “game” under any definition, I spent most of today hacking around on whatever interested me. Primarily this has been map support, allowing me to take this:

![](/images/2012-04-23-map.png)

… and turn that into this:

![](/images/2012-04-23-screen.png)

Tiling of the surface turns out to be a major problem for movement, though. Between each square tile is an invisible seam that will still trip up your movement. Solving this would be conceptually-simple - simply join these blocks together and output them as large rectangles rather than squares. However, that sounds like an opportunity to introduce more bugs and problems, so I’ll let this sleeping dragon lie.

Really, I’m just about done with the “game” parts. I want to add in the concept of player death and give the motionless agents the ability to shoot bullets every so often, but both of these should be easy enough. After that, I only want to do some cleanup (sound effects, music if I’m so inclined, and an intro screen on game launch.)