import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

/**
 * EduPredict Official Vector Logo Component (Stitch Vector)
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size='md']
 * @param {'light' | 'dark'} [props.theme='light']
 * @param {boolean} [props.markOnly=false]
 * @param {string} [props.className='']
 * @param {string} [props.linkTo] Optional URL destination
 */
export default function Logo({
  size = 'md',
  theme = 'light',
  markOnly = false,
  className = '',
  linkTo
}) {
  const isDark = theme === 'dark';
  const capColor = isDark ? '#FFFFFF' : '#0D233A';
  const textFill = isDark ? '#FFFFFF' : '#0D233A';
  const tagFill = isDark ? '#94A3B8' : '#64748B';

  const content = markOnly ? (
    <div className={`edupredict-vector-logo edupredict-vector-logo--${size} edupredict-vector-logo--mark ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="none" className="edupredict-svg">
        <g transform="translate(1, 4)">
          {/* Graduation Cap combined with Trend Growth Bar & AI Node */}
          <path d="M24 6L44 16L24 26L4 16L24 6Z" fill={capColor} />
          <path d="M12 21.5V32C12 36 24 40 24 40C24 40 36 36 36 32V21.5" stroke={capColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M40 18V34" stroke="#00B4D8" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="40" cy="35" r="2.5" fill="#00B4D8" />
          {/* Ascending Trend Chevron / Prediction arrow */}
          <path d="M18 25L24 19L30 23L38 13" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M33 13H38V18" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  ) : (
    <div className={`edupredict-vector-logo edupredict-vector-logo--${size} ${isDark ? 'edupredict-vector-logo--dark' : 'edupredict-vector-logo--light'} ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" fill="none" className="edupredict-svg">
        <g transform="translate(4, 6)">
          {/* Graduation Cap combined with Trend Growth Bar & AI Node */}
          <path d="M24 6L44 16L24 26L4 16L24 6Z" fill={capColor} />
          <path d="M12 21.5V32C12 36 24 40 24 40C24 40 36 36 36 32V21.5" stroke={capColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M40 18V34" stroke="#00B4D8" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="40" cy="35" r="2.5" fill="#00B4D8" />
          {/* Ascending Trend Chevron / Prediction arrow */}
          <path d="M18 25L24 19L30 23L38 13" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M33 13H38V18" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* EduPredict Wordmark */}
        <text x="58" y="32" fontFamily="'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" fontSize="22" fontWeight="800" fill={textFill} letterSpacing="-0.5">
          Edu<tspan fill="#00B4D8">Predict</tspan>
        </text>
        <text x="59" y="44" fontFamily="'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" fontSize="7.5" fontWeight="600" fill={tagFill} letterSpacing="0.2">
          SMART ACADEMIC &amp; PLACEMENT AI
        </text>
      </svg>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="edupredict-logo__link" aria-label="EduPredict Home">
        {content}
      </Link>
    );
  }

  return content;
}
