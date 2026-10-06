import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { reviewsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function ReviewForm({ productId, onSuccess }) {
  const { isAuthenticated } = useAuth()
  const [hoveredStar, setHoveredStar] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-gray-500 mt-4">
        <a href="/login" className="text-primary-600 underline">Sign in</a> to leave a review.
      </p>
    )
  }

  const onSubmit = async ({ comment }) => {
    if (!selectedRating) {
      toast.error('Please select a star rating.')
      return
    }
    try {
      await reviewsAPI.create({ product: productId, rating: selectedRating, comment })
      toast.success('Review submitted! It will appear after approval.')
      reset()
      setSelectedRating(0)
      onSuccess?.()
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Could not submit review.'
      toast.error(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-5 mt-6 space-y-4">
      <h3 className="font-semibold text-gray-900">Write a Review</h3>

      {/* Star selector */}
      <div>
        <p className="text-sm text-gray-600 mb-2">Your rating</p>
        <div className="flex gap-1" role="group" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelectedRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
              aria-pressed={selectedRating === star}
              className="focus:outline-none"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= (hoveredStar || selectedRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="label" htmlFor="review-comment">Your review</label>
        <textarea
          id="review-comment"
          {...register('comment', { required: 'Please write a comment.', minLength: { value: 10, message: 'At least 10 characters.' } })}
          rows={4}
          className="input-field"
          placeholder="Share your experience with this product…"
        />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}
