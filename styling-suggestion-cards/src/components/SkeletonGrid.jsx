import SkeletonCard from "./SkeletonCard/SkeletonCard.jsx";

export default function SkeletonGrid({ count = 3 }) {
  return (
    <div className="grid" role="status" aria-live="polite" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
