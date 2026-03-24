import React from 'react';
import { Calendar, DollarSign, User, MapPin } from 'lucide-react';

const Step1Profile = ({ formData, setFormData, onNext }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-military-navy-light rounded-lg shadow-2xl p-8 border-2 border-military-amber">
        <div className="flex items-center mb-6">
          <User className="w-8 h-8 text-military-amber mr-3" />
          <h2 className="text-3xl font-display text-military-amber uppercase tracking-wider">
            Member Profile
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Current Leave Balance (days)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.currentLeave}
                onChange={(e) => handleChange('currentLeave', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-military-navy border border-military-olive rounded-md text-white focus:outline-none focus:ring-2 focus:ring-military-amber"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Leave accrues at 2.5 days per month</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Today's Date
              </label>
              <input
                type="date"
                value={formData.todayDate}
                onChange={(e) => handleChange('todayDate', e.target.value)}
                className="w-full px-4 py-3 bg-military-navy border border-military-olive rounded-md text-white focus:outline-none focus:ring-2 focus:ring-military-amber"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Separation/Retirement Date
              </label>
              <input
                type="date"
                value={formData.separationDate}
                onChange={(e) => handleChange('separationDate', e.target.value)}
                min={formData.todayDate}
                className="w-full px-4 py-3 bg-military-navy border border-military-olive rounded-md text-white focus:outline-none focus:ring-2 focus:ring-military-amber"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Separation Type
              </label>
              <select
                value={formData.separationType}
                onChange={(e) => handleChange('separationType', e.target.value)}
                className="w-full px-4 py-3 bg-military-navy border border-military-olive rounded-md text-white focus:outline-none focus:ring-2 focus:ring-military-amber"
                required
              >
                <option value="separating">Separating</option>
                <option value="retiring">Retiring</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Duty Station
              </label>
              <select
                value={formData.dutyStation}
                onChange={(e) => handleChange('dutyStation', e.target.value)}
                className="w-full px-4 py-3 bg-military-navy border border-military-olive rounded-md text-white focus:outline-none focus:ring-2 focus:ring-military-amber"
                required
              >
                <option value="stateside">Stateside</option>
                <option value="overseas">Overseas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Monthly Base Pay ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.monthlyBasePay}
                onChange={(e) => handleChange('monthlyBasePay', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-military-navy border border-military-olive rounded-md text-white focus:outline-none focus:ring-2 focus:ring-military-amber"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Max Leave Allowed to Sell Back (days)
              </label>
              <input
                type="number"
                value={formData.maxSellBack}
                onChange={(e) => handleChange('maxSellBack', parseInt(e.target.value) || 60)}
                className="w-full px-4 py-3 bg-military-navy border border-military-olive rounded-md text-white focus:outline-none focus:ring-2 focus:ring-military-amber"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Previously Sold Back (days)
              </label>
              <input
                type="number"
                value={formData.previouslySoldDays}
                onChange={(e) => handleChange('previouslySoldDays', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-military-navy border border-military-olive rounded-md text-white focus:outline-none focus:ring-2 focus:ring-military-amber"
              />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              className="px-8 py-3 bg-military-amber hover:bg-military-amber-light text-military-navy font-bold uppercase tracking-wider rounded-md transition-colors duration-200 shadow-lg"
            >
              Next: Plan Timeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Step1Profile;
