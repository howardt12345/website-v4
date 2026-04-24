---
title: 'Taming rotary encoders in QMK firmware'
summary: "Two rotary encoders, four layers, zero mis-fires. A deep dive into custom encoder mapping and the debounce tricks that finally worked."
date: '2026-02-08'
readMins: 11
category: 'hardware'
subcategory: 'firmware'
tags: ['QMK', 'Firmware', 'C', 'Keyboards']
cover:
  hue: 210
  pattern: 'dots'
author: 'Howard Tseng'
---

Rotary encoders are conceptually simple: they produce A/B pulses as you turn them. In practice, getting reliable behavior across four layers with no ghost turns took longer than I'd like to admit.

## Background

keyboard0 has two encoders: one on the left for volume and scroll, one on the right for undo/redo and zoom. The base QMK encoder support works, but the default debounce is tuned for Cherry-spec switches, not encoders. The result: occasional double-fires on fast turns.

## Approach

QMK's `encoder_update_user` callback gives you the encoder index and direction. The fix isn't complicated once you understand what's happening.

### The debounce problem

The A/B lines on a mechanical encoder bounce — just like a switch contact. The default 5ms debounce that works well for key presses is too short for encoder detents at speed. I settled on 8ms after testing with a logic analyzer.

### Per-layer mappings

QMK's `get_encoder_mode_on_layer` is tempting but adds complexity. Instead, I handle all layers in a single switch statement inside `encoder_update_user`, which makes the full mapping visible in one place:

```c
bool encoder_update_user(uint8_t index, bool clockwise) {
    switch (get_highest_layer(layer_state)) {
        case _BASE:
            index == 0
                ? tap_code(clockwise ? KC_VOLU : KC_VOLD)
                : tap_code(clockwise ? KC_PGUP : KC_PGDN);
            break;
        case _NAV:
            // ...
    }
    return false;
}
```

### Trade-offs

- A longer debounce means slightly lower max RPM before drops — acceptable at normal use speeds
- Centralizing all encoder logic in one function means it grows long; I split it into a helper file after it hit 80 lines
- Testing requires actual hardware; there's no encoder simulator in QMK's test suite

## Outcome

After the debounce fix and consolidated mapping, both encoders behave exactly as expected across all four layers and at any reasonable turn speed. Total code change: 47 lines.

## What's next

I want to add haptic feedback pulses synced to encoder detents. The keyboard already has a DRV2605L footprint on the PCB — I just haven't wired it up yet.
