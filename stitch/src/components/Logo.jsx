import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/**
 * Stitch-Exact EduPredict Vector Logo Component (100% Theme-Reactive)
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size='md']
 * @param {'light' | 'dark'} [props.theme]
 * @param {boolean} [props.markOnly=false]
 * @param {string} [props.className='']
 * @param {string} [props.linkTo] Optional link destination
 */
export default function Logo({
  size = 'md',
  theme,
  variant,
  markOnly = false,
  className = '',
  linkTo
}) {
  let contextIsDark = false;
  try {
    const themeContext = useTheme();
    contextIsDark = themeContext.isDark;
  } catch (e) {
    contextIsDark = false;
  }

  // If explicitly specified 'dark' or 'light', use it; otherwise follow active theme context
  const hasExplicitDark = theme === 'dark' || variant === 'dark';
  const hasExplicitLight = theme === 'light' || variant === 'light';

  // By default, dynamic context takes precedence if no theme prop is passed
  const isDark = (theme || variant) ? hasExplicitDark : contextIsDark;

  const capColor = isDark ? '#FFFFFF' : '#00152A';
  const textFill = isDark ? '#FFFFFF' : '#00152A';
  const accentFill = isDark ? '#38BDF8' : '#0051d5';
  const tagFill = isDark ? '#94A3B8' : '#475569';
  const arrowFill = '#10B981';

  const sizeClasses = {
    sm: markOnly ? 'w-8 h-8' : 'w-48 h-12',
    md: markOnly ? 'w-11 h-11' : 'w-60 h-14',
    lg: markOnly ? 'w-13 h-13' : 'w-72 h-16',
    xl: markOnly ? 'w-16 h-16' : 'w-84 h-20'
  }[size] || (markOnly ? 'w-11 h-11' : 'w-60 h-14');

  const content = markOnly ? (
    <div className={`inline-flex items-center justify-start shrink-0 ${sizeClasses} ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="none" className="w-full h-full object-contain object-left">
        <g transform="translate(1, 4)">
          <path d="M24 6L44 16L24 26L4 16L24 6Z" fill={capColor} />
          <path d="M12 21.5V32C12 36 24 40 24 40C24 40 36 36 36 32V21.5" stroke={capColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M40 18V34" stroke={accentFill} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="40" cy="35" r="2.5" fill={accentFill} />
          <path d="M18 25L24 19L30 23L38 13" stroke={arrowFill} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M33 13H38V18" stroke={arrowFill} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  ) : (
    <div className={`inline-flex items-center justify-start shrink-0 ${sizeClasses} ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" fill="none" className="w-full h-full object-contain object-left">
        <g transform="translate(2, 5)">
          <path d="M24 6L44 16L24 26L4 16L24 6Z" fill={capColor} />
          <path d="M12 21.5V32C12 36 24 40 24 40C24 40 36 36 36 32V21.5" stroke={capColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M40 18V34" stroke={accentFill} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="40" cy="35" r="2.5" fill={accentFill} />
          <path d="M18 25L24 19L30 23L38 13" stroke={arrowFill} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M33 13H38V18" stroke={arrowFill} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <text x="54" y="31" fontFamily="'Plus Jakarta Sans', -apple-system, sans-serif" fontSize="24" fontWeight="800" fill={textFill} letterSpacing="-0.5">
          Edu<tspan fill={accentFill}>Predict</tspan>
        </text>
        <text x="55" y="44" fontFamily="'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" fontSize="7.6" fontWeight="700" fill={tagFill} letterSpacing="0.4">
          SMART ACADEMIC &amp; PLACEMENT AI
        </text>
      </svg>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-flex items-center hover:opacity-95 transition-opacity shrink-0" aria-label="EduPredict Home">
        {content}
      </Link>
    );
  }

  return content;
}
