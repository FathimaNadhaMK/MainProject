import { getRoadmap } from "@/actions/roadmap";

export default async function DebugRoadmapPage() {
    const roadmap = await getRoadmap();

    if (!roadmap) {
        return (
            <div className="p-8 bg-gray-900 min-h-screen text-white">
                <h1 className="text-3xl font-bold mb-6">No Roadmap Found</h1>
                <p>Please generate a roadmap first.</p>
            </div>
        );
    }

    // Get first week's first task's resources
    const firstWeek = roadmap.weeklyPlan?.[0];
    const firstTask = firstWeek?.tasks?.[0];
    const videos = firstTask?.resources?.videos;

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6">Roadmap Debug Info</h1>

            <div className="space-y-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Week 1 Info</h2>
                    <p className="text-gray-400 mb-2">Topic: {firstWeek?.topic || 'N/A'}</p>
                    <p className="text-gray-400 mb-2">Number of tasks: {firstWeek?.tasks?.length || 0}</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">First Task Resources</h2>
                    <p className="text-gray-400 mb-2">Task Title: {firstTask?.title || 'N/A'}</p>
                    <p className="text-gray-400 mb-4">Number of videos: {videos?.length || 0}</p>

                    {videos && videos.length > 0 ? (
                        <div className="space-y-4 mt-4">
                            <h3 className="text-lg font-semibold text-green-400">✅ Videos Found:</h3>
                            {videos.map((video, idx) => (
                                <div key={idx} className="bg-gray-700 p-4 rounded-lg">
                                    <p className="text-white font-semibold mb-2">{idx + 1}. {video.title}</p>
                                    <p className="text-gray-400 text-sm mb-1">Creator: {video.creator}</p>
                                    <p className="text-gray-400 text-sm mb-2">URL: {video.url}</p>
                                    <p className="text-gray-400 text-sm">Has Thumbnail: {video.thumbnail ? '✅ Yes' : '❌ No'}</p>
                                    <a
                                        href={video.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                                    >
                                        Test Link
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg mt-4">
                            <h3 className="text-lg font-semibold text-red-400 mb-2">❌ No Videos Found</h3>
                            <p className="text-gray-300">
                                This means your roadmap doesn't have video resources yet.
                                You need to click the "Update Roadmap" button on the roadmap page to regenerate it with videos.
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">All Resources in First Task</h2>
                    <pre className="bg-gray-900 p-4 rounded overflow-auto text-xs">
                        {JSON.stringify(firstTask?.resources, null, 2)}
                    </pre>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">💡 How to Fix</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-300">
                        <li>Go to <code className="bg-gray-700 px-2 py-1 rounded">/roadmap</code></li>
                        <li>Click the <strong>"Update Roadmap"</strong> button (top right)</li>
                        <li>Wait for the success message</li>
                        <li>Come back to this page to verify videos are now present</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
