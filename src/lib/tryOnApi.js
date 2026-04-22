// Mock API scaffold for try-on generation.
// Replace this implementation with a real backend request when the image model is ready.
export async function requestTryOnPreview({ outfit, fitState, fitAdjustmentPercent }) {
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (outfit.preGeneratedTryOnImage) {
    return {
      generatedAt: new Date().toISOString(),
      fitState,
      fitAdjustmentPercent: Math.max(-15, Math.min(15, fitAdjustmentPercent)),
      overlayScale: 1,
      overlayYOffset: 0,
      overlayOpacity: 1,
      outfitImage: outfit.preGeneratedTryOnImage,
      fullPreview: true,
    };
  }

  const normalizedAdjustment = Math.max(-15, Math.min(15, fitAdjustmentPercent));
  const overlayScale = 1 + normalizedAdjustment / 100;

  return {
    generatedAt: new Date().toISOString(),
    fitState,
    fitAdjustmentPercent: normalizedAdjustment,
    overlayScale,
    overlayYOffset: fitState === "loose" ? 8 : fitState === "tight" ? -4 : 0,
    overlayOpacity: 0.86,
    outfitImage: outfit.image,
    fullPreview: false,
  };
}
