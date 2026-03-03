## VR Is a Different Design Medium

VR game development looks familiar at first, but core assumptions from traditional game UI break quickly once a player can move, lean, and inspect from any angle.

### Performance Is Non-Negotiable

Dropped frames are not just cosmetic in VR. They directly affect comfort and retention.

### Comfort Is a Feature

Movement design, camera behavior, and interaction latency all influence comfort. A mechanic that feels fine on a monitor can fail in a headset.

### Practical Optimization Checklist

1. Profile frame time in representative scenes.
2. Reduce overdraw and expensive post-processing.
3. Keep interaction raycasts narrow and predictable.
4. Test motion at different locomotion speeds.

## Current Direction

The current prototype focuses on physics puzzle interactions where players feel capable and in control, not overloaded.
