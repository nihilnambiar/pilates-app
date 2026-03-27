// src/components/shared/Avatar.jsx
import { getInitials } from '../../utils/helpers';

export default function Avatar({ name, url, size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const cls = `${sizes[size] || sizes.md} ${className}`;

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`avatar object-cover rounded-full ${cls}`}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }

  return (
    <div className={`avatar-fallback ${cls} ring-2 ring-white shadow-sm`}>
      {getInitials(name)}
    </div>
  );
}
