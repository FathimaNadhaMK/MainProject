import { resourceFetcher } from "@/lib/resource-fetcher";

export default async function TestYouTubePage() {
    const videos = await resourceFetcher.fetchYouTubeContent("React Hooks", "Software Engineer");

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6">YouTube API Test</h1>

            <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4">Test Query: "React Hooks Software Engineer tutorial"</h2>
                <p className="text-gray-400 mb-2">Videos found: {videos?.length || 0}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos && videos.length > 0 ? (
                    videos.map((video, idx) => (
                        <a
                            key={idx}
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors border border-gray-700"
                        >
                            {video.thumbnail ? (
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full aspect-video object-cover"
                                />
                            ) : (
                                <div className="w-full aspect-video bg-gradient-to-br from-red-900/20 to-gray-900 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-red-500/50" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </div>
                            )}
                            <div className="p-4">
                                <h3 className="font-semibold text-white mb-2 line-clamp-2">{video.title}</h3>
                                <p className="text-sm text-gray-400">{video.creator}</p>
                            </div>
                        </a>
                    ))
                ) : (
                    <div className="col-span-2 text-center text-gray-400 py-12">
                        No videos found
                    </div>
                )}
            </div>

            <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <h3 className="font-semibold text-yellow-400 mb-2">Note:</h3>
                <p className="text-gray-300">
                    If you see fallback search links instead of real videos, it means the YouTube API key is invalid, expired, or quota exceeded.
                    The fallback links will still work - they open YouTube search with the query.
                </p>
            </div>
        </div>
    );
}
