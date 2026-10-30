export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`text-xl sm:text-[1.6rem] font-extrabold tracking-tight text-foreground whitespace-nowrap ${className}`}
    >
      The<span className="text-brand">Shopping</span>Habit
    </span>
  );
}
