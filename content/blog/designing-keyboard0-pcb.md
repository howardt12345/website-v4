---
title: 'Designing keyboard0: from schematic to PCB'
summary: "A walkthrough of my first custom keyboard PCB — deciding on the layout, routing under 24 hours, and the mistakes I made so you don't have to."
date: '2026-02-22'
readMins: 14
category: 'hardware'
subcategory: 'pcb'
tags: ['KiCad', 'PCB Design', 'Keyboards', 'Hardware']
cover:
  hue: 280
  pattern: 'grid'
author: 'Howard Tseng'
---

Every keyboard hobbyist eventually reaches the same point: you've built enough kits, you've swapped enough switches, and the only thing left to do is design your own. keyboard0 is mine.

## Background

The constraints were tight by design: 65% layout, south-facing switches for RGB clearance, and a fixed budget of $80 for the PCB run. I'd used KiCad for small sensor boards before, but never for anything with 68 keys of interconnected matrix routing.

## Approach

The schematic phase took two evenings. The key matrix is standard — diodes in series with each switch to prevent ghosting, rows and columns scanned by the microcontroller. The interesting decisions were around the USB-C receptacle footprint and the ESD protection circuit.

### Trade-offs

- I chose a mid-mount USB-C connector to keep the port flush with the case — this added complexity to the footprint but was worth it aesthetically
- South-facing switch footprints limited my routing channels under each switch considerably
- I added per-key RGB footprints even though I wasn't planning to populate them; solder-bridge pads cost nothing at fabrication

## The routing

Ground plane on the back, signal traces on the front. I gave myself a 0.2mm minimum trace width and clearance, which the fabricator's standard tier supports. The matrix routing took about six hours total — methodical, not fast.

The hardest part was the USB differential pair. Matching the trace lengths to within 5 mils while routing around switch footprints required three attempts and a lot of teardrops.

## What's next

The boards arrived last week. First pass: all keys register, RGB works on 61 of 68 positions (one cold joint to fix). Second spin is already in KiCad.
