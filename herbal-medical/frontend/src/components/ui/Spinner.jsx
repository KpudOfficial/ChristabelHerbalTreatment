export default function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`spinner border-2 ${sizeClasses[size]} ${className}`} role="status" aria-label="Loading" />
  )
}
