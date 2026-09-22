const PALETTE = ['bg-terracotta-400', 'bg-sage-400', 'bg-honey-400'];

function colorFor(name = '') {
  const idx = name.charCodeAt(0) % PALETTE.length;
  return PALETTE[idx] || PALETTE[0];
}

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' };
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorFor(
        name
      )} ${sizes[size]} ${className}`}
    >
      {initial}
    </div>
  );
}
