export default function StatsCards() {
  return (
    <div className="grid grid-cols-3 gap-4 my-4">
      <div className="p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-500">Confidence</p>
        <p className="text-lg font-semibold">7 / 10</p>
      </div>

      <div className="p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-500">Communication</p>
        <p className="text-lg font-semibold">8 / 10</p>
      </div>

      <div className="p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-500">Technical Depth</p>
        <p className="text-lg font-semibold">6 / 10</p>
      </div>
    </div>
  );
}
