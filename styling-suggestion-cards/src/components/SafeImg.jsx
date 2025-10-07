// En gång per build – resolva fallbacken (minskar risk för fel path)
const FALLBACK_SRC = new URL("../assets/placeholder.png", import.meta.url).href;

export default function SafeImg({ src, alt = "", ...rest }) {
  const handleError = (e) => {
    const img = e.currentTarget;
    // Redan ersatt? gör inget
    if (img.dataset.fallbackApplied === "1") return;

    // Undvik loop: koppla bort onerror INNAN vi sätter fallback
    img.onerror = null;
    img.src = FALLBACK_SRC;
    img.dataset.fallbackApplied = "1";
  };

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={handleError}
      {...rest}
    />
  );
}
