import CategoryIcon from "./CategoryIcon";

// Item photo, or a branded placeholder with the category icon when there is none.
export default function ItemImage({ item, icon, className = "", muted = false }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-naranj-soft to-cream ${className}`}>
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className={`h-full w-full object-cover ${muted ? "grayscale" : ""}`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <CategoryIcon icon={icon} className={`size-1/3 ${muted ? "text-roast/40" : "text-naranj/70"}`} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
