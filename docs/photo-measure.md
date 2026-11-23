# Measure from a photo of the scanner screen

Report tab → **Measure from a photo of the scanner screen**.

## How it works

1. **Capture.** The in-app camera takes one photo (a frozen frame) or a 2.5 s clip at 12 frames a second (two to three beats, for LV diastole and systole). You can also choose a photo or video from the phone; for a video, scrub to the frame you want first.
2. **Corners.** Drag four dots onto the corners of the scanner's screen and pick the screen's shape (16:9, 16:10, 4:3). A homography straightens the photo so distances on the screen are proportional to pixels again. A magnifier shows while you drag.
3. **Hide patient details.** A band across the top (and optionally the bottom) is blacked out on every frame. After this step the unmasked images are discarded.
4. **Scale.** A photo has no DICOM calibration, so the scale comes from what the scanner draws:
   - **2D / M-mode:** the depth ruler is found automatically (the most regular column of bright ticks on the screen) and shown as green dots to confirm; enter the tick spacing (usually 1 cm). Or drag a line along the ruler and press *Find ticks*, or drag a line between two depth labels and type the distance.
   - **Doppler:** drag one line onto the zero baseline and one onto a labelled velocity and type it; frame the spectral strip. Optionally mark two time-scale marks and type the seconds between them, which enables VTI.
5. **Measure.** Ported from EchoStudy (guided Auto 2D, REQ-AUTO-007, and Auto Doppler, REQ-AUTO-002); plain image processing, no AI:
   - **LV walls (PLAX):** one line from the RV across the septum, LV and posterior wall. Edges are found on every frame; widest cavity = diastole (IVSd, LVIDd, LVPWd), narrowest = systole (LVIDs, clips only).
   - **Diameter (auto):** the lumen around the middle of a line (LVOT, aortic root, IVC…).
   - **Caliper:** a plain two-point distance.
   - **Trace envelope:** Doppler envelope split into beats; peak velocity and mean gradient (and VTI with a time scale). Untick beats to leave them out. Targets: AV (Vmax, mean PG, VTI), LVOT VTI, TR Vmax, MV mean gradient.
   - **Single velocity:** a draggable marker for E, A, e′, S′, TR Vmax and so on.
6. **Check and add.** Every result is draggable and assigned to a report field you can change. Nothing reaches the report until you press *I've checked these*.

## Privacy

- In-app camera frames are kept in memory only (never written to the gallery or storage) and are gone when the tool closes. Only the numbers are saved, in the report draft.
- Photos or videos picked from the gallery stay there; delete them yourself if they show patient details.
- The banner mask covers what you mark; burned-in text elsewhere on the screen is not detected.

## Limits (check every value)

- **Corners and shape.** If the corners are off, or the wrong screen shape is chosen, horizontal and vertical distances scale differently. Measurements along the depth ruler's direction (most PLAX lines) are least affected. "From corners" only estimates the shape.
- **Curved or tilted screens, lens distortion and glare** distort the image or hide edges. Fill the frame, hold the phone square, avoid reflections.
- **Scale.** The ruler finder can lock onto other periodic marks; check the green dots. The tick spacing is entered by you.
- **Edges** are a brightness threshold: trabeculation, chordae, a bright mitral leaflet or a low-contrast photo can move them. Diastole and systole are taken from cavity width, not the ECG.
- **Doppler** envelopes may include noise or miss faint signal; aliasing and clipping are warned about. Mean gradient comes from the traced beats; VTI needs a time scale.
- **No AI LV volumes.** EchoStudy's Auto LV (EchoNet) model is 75 MB and research-licensed, so it is not in the app.

## Tests

`npm test` runs `test/photo.test.ts`: a synthetic screen photographed at an angle is straightened, its ruler found (40 px/cm within 0.5 px) and IVSd/LVIDd/LVPWd measured within 0.12 cm; LVIDs from a clip; Doppler peak, mean gradient and VTI on synthetic beats; unit conversion to report fields.

A browser check on a synthetic angled photo (truth IVSd 1.0, LVIDd 5.0, LVPWd 0.9 cm) gave 1.00, 5.01 and 0.93 cm; a synthetic CW strip (truth 4.0 m/s, mean PG 32 mmHg) gave 4.00 m/s and 34 mmHg.
