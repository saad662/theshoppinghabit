export function Logo({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span
      className={`text-xl sm:text-[1.6rem] font-extrabold tracking-tight whitespace-nowrap ${dark ? "text-cream" : "text-foreground"} ${className}`}
    >
      The<span className={dark ? "text-pop" : "text-brand"}>Shopping</span>Habit
    </span>
  );
}
