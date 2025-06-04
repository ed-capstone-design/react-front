const InfoCard = ({ title, value, desc }) => (
  <div className="bg-white rounded shadow p-6 flex-1 min-w-[200px]">
    <div className="text-gray-500 text-sm mb-1">{desc}</div>
    <div className="text-2xl font-bold mb-2">{value}</div>
    <div className="text-blue-700 font-semibold">{title}</div>
  </div>
);export default InfoCard;