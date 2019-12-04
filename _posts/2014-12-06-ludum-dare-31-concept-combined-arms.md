---
title:  Ludum Dare 31 Concept - “Combined Arms”
date:   2014-12-06
tags: ludumdare unity3d
---

Unfortunately I didn’t have enough time this weekend to participate in this round of [Ludum Dare](http://ludumdare.com/compo/) so I’m sketching out what I would have attempted given the chance.

The theme is “Entire Game on One Screen.” I thought about screens for awhile and how they are just a simplified view of an underlying system, similar in nature to Plato’s allegory of the Cave. I wanted to make something that really exploited that and provided imperfect information to the player.

COMBINED ARMS is a two-player co-operative mini-RTS that simulates the ground invasion of a city supported by a fleet of ships in orbit.

## The View from Space

One player is the Fleet Admiral and sees an interface like so:

![](/images/2014-12-06-screen-1.png)

This player can see the entire map and the current status of all objectives. A number of control points have to be held before the capital (large building in top left) can be taken by friendly troops. The orbital commander can also take various strategic actions on a time delay (simulating the delay between launching something from orbit and seeing its effects). These actions include:

* Getting a city-wide scan that indicates troop density
* Getting a smaller scan that indicates unit position and type
* Launching a number of different kinds of orbital strikes doing general area damage, targeting buildings, or targeting specific types of units
<br>

Except for the moments after a scan, the Fleet Admiral lives in fog of war. The player can see the theatre of battle but doesn’t really understand any specific situation on the ground except as relayed by the ground commander.

## The View from the Ground

The other player is the Ground Commander. The ground commander has a more typical third-person view of a small squad of units.

![](/images/2014-12-06-screen-2.png)

The Ground Commander is massively outnumbered by hostile troops and must use the power of the orbital fleet to even the odds. The Ground Commander has an almost perfect understanding of their immediate surroundings, but no strategic view of the city or objectives.

The Commander controls 4-6 units at a time. As units are lost, the Admiral can send in replacements but they are slow to arrive, and the fleet is otherwise useless while preparing them. 

The war on the ground is relatively simple - units come in three flavors: tanks, walkers, and fliers. Tanks are slow, strong, excellent versus walkers, and can slowly destroy buildings. Fliers are fast, frail, excellent versus tanks, and ignore all but the tallest buildings. Walkers are a middle-of-the-road choice which are excellent versus fliers and can slowly move through buildings.

---

The “game” of Combined Arms is as much a game of memory and communication as it is tactics and strategy. It blatantly steals some of my favorite bits of Wargame, World in Conflict, and Full Spectrum Warrior and I make no claim of it being original (indeed, you could say it’s just a strategy take on [Clandestine](http://store.steampowered.com/app/290530/)).

While I don’t have time this LD to do much more than make fake screenshots, this might be an idea I visit in the future.