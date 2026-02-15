/**
 * Reusable skeleton loading components
 */

// Skeleton Card - for stat cards and info boxes
export function SkeletonCard({ className = "" }) {
    return (
        <div className={`card bg-base-100 shadow-lg border border-base-300 animate-pulse ${className}`}>
            <div className="card-body">
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-base-300"></div>
                    <div className="flex-1">
                        <div className="h-3 bg-base-300 rounded w-24 mb-2"></div>
                        <div className="h-6 bg-base-300 rounded w-16"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Skeleton Stat - for dashboard stat boxes
export function SkeletonStat({ className = "" }) {
    return (
        <div className={`card bg-base-100/50 backdrop-blur-sm border border-base-300/50 shadow-lg animate-pulse ${className}`}>
            <div className="card-body p-5">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-3 bg-base-300 rounded w-20"></div>
                        <div className="h-8 bg-base-300 rounded w-12"></div>
                    </div>
                    <div className="size-12 rounded-xl bg-base-300"></div>
                </div>
            </div>
        </div>
    );
}

// Skeleton Table Row - for session/question tables
export function SkeletonTableRow({ columns = 4 }) {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="py-4">
                    <div className="h-4 bg-base-300 rounded w-full max-w-[120px]"></div>
                </td>
            ))}
        </tr>
    );
}

// Skeleton Table - full table with header and rows
export function SkeletonTable({ rows = 5, columns = 4, className = "" }) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="table">
                <thead>
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i}>
                                <div className="h-3 bg-base-300 rounded w-20 animate-pulse"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <SkeletonTableRow key={i} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Skeleton Session Card - for session list items
export function SkeletonSessionCard({ className = "" }) {
    return (
        <div className={`card bg-base-100 shadow border border-base-300 animate-pulse ${className}`}>
            <div className="card-body p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                        <div className="h-5 bg-base-300 rounded w-48"></div>
                        <div className="flex gap-2">
                            <div className="h-5 bg-base-300 rounded w-16"></div>
                            <div className="h-5 bg-base-300 rounded w-20"></div>
                        </div>
                        <div className="h-3 bg-base-300 rounded w-32"></div>
                    </div>
                    <div className="h-8 bg-base-300 rounded w-24"></div>
                </div>
            </div>
        </div>
    );
}

// Skeleton Text - for paragraphs
export function SkeletonText({ lines = 3, className = "" }) {
    return (
        <div className={`space-y-2 animate-pulse ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-base-300 rounded"
                    style={{ width: `${Math.random() * 30 + 70}%` }}
                ></div>
            ))}
        </div>
    );
}

// Skeleton Chart - for analytics charts
export function SkeletonChart({ height = "200px", className = "" }) {
    return (
        <div
            className={`bg-base-200 rounded-xl animate-pulse flex items-center justify-center ${className}`}
            style={{ height }}
        >
            <div className="text-base-content/30 text-sm">Loading chart...</div>
        </div>
    );
}

// Loading Button - for async actions
export function LoadingButton({
    loading,
    children,
    loadingText = "Loading...",
    className = "",
    ...props
}) {
    return (
        <button
            className={`btn ${className}`}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <>
                    <span className="loading loading-spinner loading-sm"></span>
                    {loadingText}
                </>
            ) : (
                children
            )}
        </button>
    );
}
