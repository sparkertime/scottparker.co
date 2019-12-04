---
title:  Braindump on the Next Game
date:   2014-03-19
---

![](/images/2014-03-19-mutants.png)

I've started work on another game, title officially TBD but let's call it MO for now. The goal is to build an asynchronous multiplayer turn-based strategy game that takes about 30-60 turns with about 3-5 "actions" per turn.

I'm still fleshing out the mechanics, but I want to share my principles / constraints so far:

* Hex-based game where war is a factor, but not the only path to victory. Likely based on victory points where conquest is only one route to that goal, but other options may include economic, diplomatic, or intrigue paths.
* Terrain influences tactics, but there is no such thing as a "bad start" or "good start" - all terrain under your control can be put to use.
* Hexes are also essentially "slots" for you to build a single upgrade or improvement. In a game like Civilization, you are constructing cities which are bundles of upgrades and improvements on one location hidden behind menus. No. In MO each tile can sustain one and only one construction. All players can see the improvement and can get a tooltip for more information, but there is no concept of "drilling down into" a tile to see what's really there.
* Different tiles provide different kinds of currencies, but each kind can be used to pay for the same things. The kind of currency you use determines small variations in the capabilities of that thing, but not in your ability to purchase it.
* Each player controls at most between 1-3 units total. To achieve this, units should be expensive, meaningful, and somewhat difficult to kill.