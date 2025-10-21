'use client'

import { useState } from 'react'

interface RatingStarsProps {
  rating: number
  totalRatings?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  showCount?: boolean
  disabled?: boolean
}

export default function RatingStars({
  rating,
  totalRatings,
  size = 'sm',
  interactive = false,
  onChange,
  showCount = true,
  disabled = false
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating
  const stars = [1, 2, 3, 4, 5]

  const handleClick = (star: number) => {
    if (interactive && onChange && !disabled) {
      onChange(star)
    }
  }

  const handleMouseEnter = (star: number) => {
    if (interactive && !disabled) {
      setHoverRating(star)
    }
  }

  const handleMouseLeave = () => {
    if (interactive && !disabled) {
      setHoverRating(0)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {stars.map((star) => {
          const filled = star <= Math.round(displayRating)
          const partial = star > Math.floor(displayRating) && star <= Math.ceil(displayRating)
          const fillPercentage = partial ? ((displayRating % 1) * 100) : (filled ? 100 : 0)

          return (
            <div
              key={star}
              className={`relative ${interactive && !disabled ? 'cursor-pointer' : ''}`}
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Estrela de fundo (vazia) */}
              <svg
                className={`${sizeClasses[size]} text-gray-300 ${disabled ? 'opacity-50' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>

              {/* Estrela preenchida (overlay) */}
              {fillPercentage > 0 && (
                <div
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <svg
                    className={`${sizeClasses[size]} text-yellow-400 ${disabled ? 'opacity-50' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showCount && (
        <div className={`${textSizeClasses[size]} text-gray-600 ml-1 flex items-center gap-1`}>
          <span className="font-semibold">{rating.toFixed(1)}</span>
          {totalRatings !== undefined && (
            <span className="text-gray-500">
              ({totalRatings} {totalRatings === 1 ? 'avaliação' : 'avaliações'})
            </span>
          )}
        </div>
      )}
    </div>
  )
}

