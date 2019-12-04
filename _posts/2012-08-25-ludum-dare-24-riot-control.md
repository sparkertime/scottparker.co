---
title:  Ludum Dare 24 – Riot Control
date:   2012-08-25
tags:   ludumdare
---

After a couple of hours of thinking and drinking, I’ve finally hit upon an idea that I think is feasible and interesting for the Ludum Dare theme “Evolution.”

I’m a mild [ochlophobe](https://en.wikipedia.org/wiki/Ochlophobia), which means I have difficulty with large, densely populated crowds. As such, reading the research paper [Crowd Disasters as Systemic Failures: Analysis of the Love Parade Disaster](https://epjdatascience.springeropen.com/articles/10.1140/epjds7) was terrifying and it has remained lodged in my mind ever since.

All of this is a long winded way of saying I’ve had crowds on my mind lately. So when Evolution was announced, a thousand ideas came and went (“Lemmings + Genetic Algorithms!”, “Temple of Doom and Speciation!”) until I settled on something interesting, but also simple enough I stand a chance of implementing it in a weekend: selecting paths through a city for rioters such that they pick up new and diverse elements from the city while avoiding cops and opposing elements.

Still vague and high level, but the idea will be to trace a path through the lines of a Voronoi diagram (which should theoretically resemble the winding streets of an old European city)so that a cloud of dots can traverse it and “absorb” some of the elements of the Voronoi polygons it walks adjacent to.