import { motion } from "framer-motion";

export default function SkeletonCard() {
  return (
    <motion.article
      className="card skeleton"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-hidden="true"
    >
      <div className="sk-img" />
      <div className="sk-content">
        <div className="sk-line sk-w-60" />
        <div className="sk-line sk-w-90" />
        <div className="sk-tags">
          <span className="sk-tag" />
          <span className="sk-tag" />
          <span className="sk-tag" />
        </div>
      </div>
      <div className="sk-footer">
        <div className="sk-line sk-w-50" />
        <div className="sk-heart" />
      </div>
    </motion.article>
  );
}
