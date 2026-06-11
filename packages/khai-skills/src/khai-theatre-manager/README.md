# Theatre Manager

## Problem

A production house holds plays, but someone has to run it: stage each finished
play into it, keep every play in the house voice and logged to the house Estate,
version the house as plays land, and hold the gates so nothing broken or off-voice
is presented. Done by hand, this is easy to get subtly wrong, and a house that is
off-voice, unversioned, or unconformant cannot be trusted to answer for its run.

## Solution

In khai-theatre-manager mode you run one house. You stage finished plays into it
(Estate resolved, in voice, conformant), version it by the house rule (a new play
is a minor bump, everything else a patch), and keep its gates (the guard picks the
lane; the gate is never bypassed; nothing is merged). Work that needs more than the
house can change is aligned upward to the chain rather than forced from inside.

## What you get

A clean, conformant, in-voice house, presented upward to the chain: every play
logged to the Estate with a resolving link, the version reflecting the play count,
the gates intact, and any cross-house need raised rather than hacked in locally.
