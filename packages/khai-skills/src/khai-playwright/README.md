# Creating a play

## Problem

A khai production has a defined structure: a play file that sets the boundary, plots that cast forces inside it, and elements the plots draw on. Building one by hand (keeping the Company closed, the Triggers chained, and every plot in lane) is easy to get wrong and hard to check without a guide.

## Solution

This skill authors a khai play in two modes. Mode A produces the play file alone: the ENACTS container with its six chapters (Estate, Name, Arc, Company, Triggers, Stakes). Mode B produces the full production: the play file plus every plot the Triggers chain, plus every process, position, piece, place, and persona those plots draw on. The skill enforces the closed-Company rule (a plot may not reference an element the Company did not name) and runs the self-check at each stage.

## What you get

Mode A: a single `play_[name].md` file. Mode B: a zip of the whole production in the world layout: one play file, one plot file per chained plot, and one element file per Company member a plot draws on.
