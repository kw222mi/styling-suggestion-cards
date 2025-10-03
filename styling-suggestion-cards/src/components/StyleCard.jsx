import { motion } from "framer-motion";

export default function StyleCard({ outfit, isFavorite, onToggleFavorite }){
   return (
     <motion.article
       className="card"
       aria-label={`Outfit ${outfit.title}`}
       whileHover={{ y: -2, scale: 1.01 }}
       whileTap={{ scale: 0.995 }}
       transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.2 }}
       layout
     >
       <img src={outfit.image} alt={outfit.title} loading="lazy" />
       <div className="content">
         <strong>{outfit.title}</strong>
         <p style={{ opacity: 0.9 }}>{outfit.description}</p>
         <div className="badges">
           {outfit.tags.map((t) => (
             <span className="badge" key={t}>
               {t}
             </span>
           ))}
         </div>
       </div>
       <div className="footer">
         <span
           title={outfit.items.join(", ")}
           style={{
             whiteSpace: "nowrap",
             overflow: "hidden",
             textOverflow: "ellipsis",
             maxWidth: "60%",
           }}
         >
           {outfit.items.join(" · ")}
         </span>
         <motion.button
           onClick={onToggleFavorite}
           aria-pressed={isFavorite}
           whileTap={{ scale: 0.8 }}
           animate={{ scale: [1, 1.3, 1] }}
           transition={{ duration: 0.25 }}
           style={{ fontSize: "1.3rem", lineHeight: "1" }}
         >
           {isFavorite ? "♥" : "♡"}
         </motion.button>
       </div>
     </motion.article>
   );
}
