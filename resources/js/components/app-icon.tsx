export default function AppIcon({
    className = 'h-9 w-9',
}: {
    className?: string;
}) {
    return (
        <img
            src="/icon.svg"
            alt="Casanare Devs"
            className={className + ' object-contain'}
            loading="lazy"
            decoding="async"
        />
    );
}
