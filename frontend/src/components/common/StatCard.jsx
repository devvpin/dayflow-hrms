const StatCard = ({ title, value, subtitle, icon, color = 'primary' }) => {
  const colorMap = {
    primary: 'text-primary bg-primary/10',
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    danger: 'text-red-600 bg-red-100',
    info: 'text-blue-600 bg-blue-100'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
      <div className="flex-1">
        <h3 className="font-medium text-gray-500 text-sm">{title}</h3>
        <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      {icon && (
        <div className={`p-3 rounded-full ${colorMap[color] || colorMap.primary}`}>
          {icon}
        </div>
      )}
    </div>
  );
};

export default StatCard;
