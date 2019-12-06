---
title:  Drafting RoboRosewater
tags:   mtg
teaser: /images/2016-07-16-packs.jpg
excerpt: Real humans playing with AI-generated Magic cards. Broken hilarity ensures.
---

![]({{ "/images/2016-07-16-packs.jpg" | absolute_url }})

I love, love, _love_ the [RoboRosewater](https://twitter.com/RoboRosewater) Twitter account. It brought me back into Magic after a 18 year hiatus. Most of the cards are hilarious gibberish, some are playable or near-playable, and some few are both playable and novel cards. After following the RoboRosewater account for a long time, I decided to build a draft set out of the cards from or derived from RoboRosewater cards. How hard could that be?

Read on to find out.

## FIRST, A GIANT DISCLAIMER

I don’t know Magic particularly well. This is my third ever Magic draft. I would rate my skill somewhere between “RTFM” and “lol.” I still get confused about simple things like when you declare blockers vs assign damage. I still say “interrupt” all the time. If you are reading this to follow in my footsteps, be warned: here be dragons, lots of derp, and a bit of [hherp](https://twitter.com/roborosewater/status/673228003351113728) too.

## HOW ABOUT A SECOND DISCLAIMER?

It’s misleading to call this a RoboRosewater draft due to how many changes I made. The more accurate way to describe this is a  set _heavily influenced by_ RoboRosewater. When I made changes, I kept the title of the card and tried my best to keep the spirit of the card intact. This draft set probably isn't as wild or fun as a pure RoboRosewater draft set. If you want that, I highly recommend this instead:

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Album&#39;s here: <a href="https://t.co/Msi6eqraDL">https://t.co/Msi6eqraDL</a> and a pdf w/ correct scale: <a href="https://t.co/dZm2WF2TEB">https://t.co/dZm2WF2TEB</a></p>&mdash; μ (@mu_is_a_letter) <a href="https://twitter.com/mu_is_a_letter/status/750813229258072064?ref_src=twsrc%5Etfw">July 6, 2016</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Goals

My goal in building this draft set was pretty simple. I wanted to make a set of cards that could be used in a mock draft (not a cube of singletons) under the following constraints:

*   Incorporate cards from RoboRosewater, staying as faithful as possible.
*   Avoid cards that completely disregard the color pie like [white counterspells](https://twitter.com/roborosewater/status/719599781887258624).
*   Make sure each color is playable - has a good mix of powerful cards and generally adheres to a sane mana curve.
*   Make sure each game is playable  - there shouldn’t be any cards so horribly broken that the opponent has no chance to respond before the game ends.
*   Generally respects rarities - bad-to-solid cards at common, solid-to-great cards at uncommon, and good-to-bomb cards at rare.

My purpose with these constraints was to simulate a proper set, but also to allow people to unleash their inner planeswalkers. In a set with no deliberately designed archetypes or stragies, who in our group would be able to discover and exploit the most powerful synergies and decks?

## Process

I ended up having to make a number of tweaks as I went through this process. The primary cause is that not all cards are created equally. RoboRosewater makes green cards almost twice as often as black cards for instance - 39 total playable green cards vs 22 black cards when I last looked. It’s a similar story for types - 117 creatures vs just 51 sorceries, instants, and enchantments.

Because I wanted this to be a draft simulation, I also had to make costing changes to smooth out the mana curve for each color. I used [the draft frequencies of Shadows over Innistrad](http://www.mtggoldfish.com/articles/expected-numbers-of-specific-cards-in-shadows-over-innistrad-limited) as a starting point and came up with the following rough frequencies by rarity:

*   A given common should appear 2-4 times
*   A given uncommon should appear twice
*   A given rare should appear once
*   A given mythic garbage should appear once

Furthermore I went with the following per-pack distributions:

*   Common: 9.67 cards
*   Uncommon: 3 cards
*   Rare: 1 card
*   Mythic Garbage: 0.33 cards

## Wait, Mythic _Garbage_?

A RoboRosewater draft wouldn’t be complete without a few playable but totally useless cards. I couldn’t bear the thought of leaving out good ol’ [Racka Rornoshy](https://twitter.com/RoboRosewater/status/654730074508275717) for instance:

![](/images/2016-07-16-racka.jpg)

Since the power level of RoboRosewater seemed higher than “average” Magic, I repurposed mythic rares as **mythic garbage** instead.

## Changes

Most changes were limited to costing, color changes, or cleaning up the text to conform to modern templating and fix minor illegalities/misunderstandings. I removed or altered mana abilities on creatures and permanents to ensure that any two-color combination was equally draftable. This meant that a creature or artifact never generates a color of mana that wasn’t required to cast it.

RoboRosewater loves to refer to tribal themes where it doesn’t generate many creatures within the tribe. I made every effort to fix those references so that no participant in the draft felt misled and every tribal power has a least a few members of that tribe in the draft.

I had to heavily edit a number of lands. RoboRosewater loves to generate lands that are pretty bonkers. For instance, here’s the original [Wulder of Boon](https://twitter.com/RoboRosewater/status/610885948142940160) and [Fire Sheap](https://twitter.com/RoboRosewater/status/645675265306329088):
 
 ![](/images/2016-07-16-wulder.png)

Neither is very compelling or sensible on their own, so I combined the spirit of Fire Sheap (land with consumable counters) and Wulder of Boon (land that can adjust p/t or generate mana) to create the final versions of those two cards that made the draft:

![](/images/2016-07-16-wulder-revised.png)

Finally, I made changes to extrapolate interesting keywords and effects that weren’t defined by the cards themselves. [Joto of Same Uftine](https://twitter.com/roborosewater/status/673228003351113728) is a good example - Hherp is interesting enough that it _should_ do something related to casting from hand...

![](/images/2016-07-16-hherp.png)

After thinking a lot about what it meant to “cast a card from hand”, Joto became this:

![](/images/2016-07-16-joto.jpg)

(Joto also gained reach because green was desperately short of ways to deal with fliers)

Manduj Masthorow is another good example - what is “borest strike” exactly?

![](/images/2016-07-16-manduj.jpg)

The idea for this definition didn’t even come from me but from one of the Twitter responses:

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr"><a href="https://twitter.com/RoboRosewater?ref_src=twsrc%5Etfw">@RoboRosewater</a> Borest Strike (this creature deals damage after creatures without borest strike)</p>&mdash; 马塞洛·乾酪 (@Lil_cheez) <a href="https://twitter.com/Lil_cheez/status/670337993182461953?ref_src=twsrc%5Etfw">November 27, 2015</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Thus, Manduj’s final form:

![](/images/2016-07-16-manduj-revised.jpg)

## Enough Already, Spoil Me!

Thanks for bearing with me. I just wanted to make sure you understood the intent and constraints behind some of the cards that were changed.

[All Commons, Uncommons, and Rares (imgur)](http://imgur.com/a/Sym99)

[All Mythic Garbages (imgur)](http://imgur.com/a/B1N7n)

## What Happens Next?

We are currently playtesting this draft set. **I do not recommend putting together a draft of these cards at this time.** Even just the initial draft revealed a few problems - [Hydrobow Sunchaser](http://i.imgur.com/8gSqCYg.jpg) is unintentionally overpowered as it can return **itself** from the graveyard. On the flipside, I took [the original Fortigang Tramber](https://twitter.com/RoboRosewater/status/733732888605253632) and made it even worse, creating [the least liked card in the draft](http://i.imgur.com/2XXY9ce.jpg).

At [Braintree](https://www.braintreepayments.com/) we turn drafts into “draft leagues” that run over the course of a couple of weeks. When this league finishes, I’ll post…

*   A revised set of cards that include balance tweaks we've discovered like the above.
*   The two decklists of the participants in the championship match
*   Exact card distributions for an eight-person mock draft of this set and a [Magic Set Editor](http://magicseteditor.sourceforge.net/) file for printing or modifying them.

Finally, let me again express my gratitude to RoboRosewater by paraphrasing [one of my favorite quotes](http://www.malcolm-x.org/quotes.htm):

> If anything in this set brings you joy or fun, all of the credit is due to [RoboRosewater](https://twitter.com/RoboRosewater). Only the mistakes are mine.

Please feel free to ask any questions you have about this [via Twitter](https://twitter.com/citizenparker).
