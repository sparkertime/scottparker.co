---
title:  Making an Asynchronous Turn-based Game in Unity, Part I
date:   2014-06-13
tags: unity3d
---

In [my previous post on my next game project "Clans"](/another-game-in-the-works-clans) I outlined the kind of asynchronous turn-based strategy game I want to make. I didn't discuss the implementation details though.

An asynchronous game implies there are persistent servers available to coordinate game state between players. I want to leave the option of an offline mode available, and I also need to make this easy to develop without having to run a server locally.

I experimented with a few options but it came down to two: build my game logic in a separate assembly and reference that from Unity, or take the compiled DLLs Unity creates of my custom code and find a way to run them without most of Unity.

## Option 1: Separate Project

While building my game logic as a separate assembly is more logical and definitely cleaner, I ran into a few issues. While I don't need most of what Unity provides in classes like MonoBehavior for my game logic, the utility classes around math and vectors would be a big help. Furthermore, Unity periodically likes to rebuild your solution files which forces me to periodically re-add my GameLogic project.

## Option 2: Headless Unity

When you build & run your Unity game, Unity compiles all of the custom code you've written for your game into a DLL named "Assembly-<language>.dll" (in my case, Assembly-CSharp.dll). This won't work on it's own though - you'll need to pull in a few additional DLLs from core Unity to make it work. 

After I tracked down those DLLs though, I was able to make a simple command-line application that used those DLLs to process some simple game logic. I'll have to be diligent in separating my logic code from anything that requires Unity's "MonoBehavior" components as anything that references any of their event lifecycle hooks like Start() and Update() won't work. This shouldn't be a problem for turn-based strategy games, as they shouldn't be making use of Unity's game physics or other logical components for any important bits of game state.

In the next installment I'll show how all of this is going to come together. I may even make a diagram! GET READY