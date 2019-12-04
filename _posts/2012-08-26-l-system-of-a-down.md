---
title:  Ludum Dare 24 – L-System of a Down
date:   2012-08-26
tags:   ludumdare
---

Haven’t posted yet this Ludum Dare. Kept hoping to have some better progress to show, but with < 30 minutes before the deadline, it ain’t happening. Ah well, I’ve learned a heck of a lot, probably more than last time around.

When we last spoke, I was pondering a rioting game based on traversing the edges of voronoi diagrams. I ultimately abandoned this midway through on Saturday for two reasons:

* I hacked together a really simple prototype on pre-generated Voronoi paths and it was incredibly not fun, even by my meager requirements for this project
* Voronoi diagrams can make semi-suitable roadways for medieval towns, hamlets, etc, but they really aren’t believable as the basis of a city.

I decided that ultimately procedurally generating a city was a more interesting problem to me than making a game at the moment, and switched gears. In particular, making an open-sourced Clojure implementation of the “CityEngine” as described in the paper [Procedural Modeling of Cities (PDF)](http://www.cs.purdue.edu/homes/aliaga/cs197-10/papers/p_cities.pdf). The basis of this is what the authors call an “Extended L-System.” Basically, an L-system is a context-free grammar where all the rules are applied in parallel as successive generations of change.

Progress is slow (somewhat faster now that I switched to [Quil](https://github.com/quil/quil) from [Seesaw](https://github.com/daveray/seesaw/) as my UI library) but here’s what I have so far.

![](/images/2012-08-26-screen-1.jpg)

The basis for directing road growth in the paper is an externally supplied topography (basically boundaries for where roads can exist) and a population heatmap. I’ve combined the two into one image where black is “no one at all lives here because it is water. DO NOT GO HERE”.


![](/images/2012-08-26-screen-2.jpg)

This is a few generations into my roadways. Right now they’re very dumb in that they exclusively target population centers without taking into account other nearby roads. Making them road-aware is probably the next step.

Anyway, I suppose technically this is mission failed since I have nothing to submit, but I’m happy with my progress and and I plan on seeing this through. There’s no open-source implementation of this in any language that I can find and the paper leaves much to the reader (as any good academic paper should) so I feel like I’m doing some real trailblazing!

Now if I can just find a way to work on Quil in the REPL without crashing it every 20 minutes, I’ll be happy.