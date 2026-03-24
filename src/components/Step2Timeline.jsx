import React, { useState, useMemo } from 'react';
import { Calendar, Plus, Trash2, AlertTriangle, Briefcase } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import GanttChart from './GanttChart';
import {
  calculatePTDY,
  calculateMonthsRemaining,
  calculateProjectedLeave,
  calculateLeaveBalance,
  findOctoberFirstDates,
  checkOctoberFirstWarnings,
  validateLeaveBalance,
  getPTDYPeriods,
  calculateTotalPTDYDays,
  calculateTotalTransitionDays,
  validateTransitionLimit,
  calculateOptimalSplit,
  calculateMaxSellBack,
  parseLocalDate
} from '../utils/calculations';

const Step2Timeline = ({ formData, setFormData, onNext, onBack }) => {
  const [newLeaveBlock, setNewLeaveBlock] = useState({
    startDate: '',
    endDate: '',
    label: '',
    isTransition: false
  });

  const [newSkillbridge, setNewSkillbridge] = useState({
    startDate: '',
    endDate: '',
    label: ''
  });

  const [newPTDY, setNewPTDY] = useState({
    startDate: '',
    endDate: '',
    label: ''
  });

  const [editingSkillbridge, setEditingSkillbridge] = useState(null);
  const [editingPTDY, setEditingPTDY] = useState(null);
  const [editingLeave, setEditingLeave] = useState(null);

  const ptdyDays = useMemo(() => {
    return calculatePTDY(formData.separationType, formData.dutyStation);
  }, [formData.separationType, formData.dutyStation]);

  const ptdyPeriods = useMemo(() => {
    return getPTDYPeriods(
      formData.separationType,
      formData.dutyStation,
      formData.skillbridge,
      formData.separationDate,
      formData.ptdyBlocks
    );
  }, [formData.separationType, formData.dutyStation, formData.skillbridge, formData.separationDate, formData.ptdyBlocks]);

  const totalPTDYDays = useMemo(() => {
    return calculateTotalPTDYDays(formData.separationType, formData.dutyStation, formData.skillbridge, formData.ptdyBlocks);
  }, [formData.separationType, formData.dutyStation, formData.skillbridge, formData.ptdyBlocks]);

  const maxPTDYDays = useMemo(() => {
    return calculatePTDY(formData.separationType, formData.dutyStation);
  }, [formData.separationType, formData.dutyStation]);

  const remainingPTDYDays = useMemo(() => {
    const usedPTDY = formData.ptdyBlocks.reduce((total, ptdy) => {
      return total + differenceInDays(parseLocalDate(ptdy.endDate), parseLocalDate(ptdy.startDate)) + 1;
    }, 0);
    return maxPTDYDays - usedPTDY;
  }, [maxPTDYDays, formData.ptdyBlocks]);

  const monthsRemaining = useMemo(() => {
    return calculateMonthsRemaining(parseLocalDate(formData.todayDate), parseLocalDate(formData.separationDate));
  }, [formData.todayDate, formData.separationDate]);

  const projectedLeave = useMemo(() => {
    return calculateProjectedLeave(formData.currentLeave, monthsRemaining, formData.accrualRate);
  }, [formData.currentLeave, monthsRemaining, formData.accrualRate]);

  const leaveCalculation = useMemo(() => {
    return calculateLeaveBalance(
      formData.currentLeave,
      formData.accrualRate,
      formData.todayDate,
      formData.separationDate,
      formData.plannedLeave
    );
  }, [formData.currentLeave, formData.accrualRate, formData.todayDate, formData.separationDate, formData.plannedLeave]);

  const octoberFirstDates = useMemo(() => {
    return findOctoberFirstDates(parseLocalDate(formData.todayDate), parseLocalDate(formData.separationDate));
  }, [formData.todayDate, formData.separationDate]);

  const octoberWarnings = useMemo(() => {
    return checkOctoberFirstWarnings(leaveCalculation.timeline, octoberFirstDates);
  }, [leaveCalculation.timeline, octoberFirstDates]);

  const validation = useMemo(() => {
    return validateLeaveBalance(leaveCalculation.timeline);
  }, [leaveCalculation.timeline]);

  const maxSellBack = useMemo(() => {
    return calculateMaxSellBack(formData.maxSellBack, formData.previouslySoldDays);
  }, [formData.maxSellBack, formData.previouslySoldDays]);

  const optimalSplit = useMemo(() => {
    return calculateOptimalSplit(
      leaveCalculation.finalBalance,
      maxSellBack,
      formData.separationDate,
      formData.monthlyBasePay,
      ptdyPeriods
    );
  }, [leaveCalculation.finalBalance, maxSellBack, formData.separationDate, formData.monthlyBasePay, ptdyPeriods]);

  const totalTransitionDays = useMemo(() => {
    return calculateTotalTransitionDays(
      formData.skillbridge,
      formData.ptdyBlocks,
      optimalSplit.terminalLeaveDays,
      formData.plannedLeave
    );
  }, [formData.skillbridge, formData.ptdyBlocks, optimalSplit.terminalLeaveDays, formData.plannedLeave]);

  const transitionLimitWarnings = useMemo(() => {
    return validateTransitionLimit(totalTransitionDays.totalDays, 180);
  }, [totalTransitionDays.totalDays]);

  const addLeaveBlock = () => {
    if (newLeaveBlock.startDate && newLeaveBlock.endDate && newLeaveBlock.label) {
      setFormData(prev => ({
        ...prev,
        plannedLeave: [...prev.plannedLeave, { ...newLeaveBlock, id: Date.now() }]
      }));
      setNewLeaveBlock({ startDate: '', endDate: '', label: '', isTransition: false });
    }
  };

  const removeLeaveBlock = (id) => {
    setFormData(prev => ({
      ...prev,
      plannedLeave: prev.plannedLeave.filter(block => block.id !== id)
    }));
    setEditingLeave(null);
  };

  const updateLeaveBlock = (id, updatedBlock) => {
    setFormData(prev => ({
      ...prev,
      plannedLeave: prev.plannedLeave.map(block => 
        block.id === id ? { ...block, ...updatedBlock } : block
      )
    }));
    setEditingLeave(null);
  };

  const addSkillbridge = () => {
    if (newSkillbridge.startDate && newSkillbridge.endDate && newSkillbridge.label) {
      setFormData(prev => ({
        ...prev,
        skillbridge: [...prev.skillbridge, { ...newSkillbridge, id: Date.now() }]
      }));
      setNewSkillbridge({ startDate: '', endDate: '', label: '' });
    }
  };

  const removeSkillbridge = (id) => {
    setFormData(prev => ({
      ...prev,
      skillbridge: prev.skillbridge.filter(block => block.id !== id)
    }));
    setEditingSkillbridge(null);
  };

  const updateSkillbridge = (id, updatedBlock) => {
    setFormData(prev => ({
      ...prev,
      skillbridge: prev.skillbridge.map(block => 
        block.id === id ? { ...block, ...updatedBlock } : block
      )
    }));
    setEditingSkillbridge(null);
  };

  const addPTDY = () => {
    if (newPTDY.startDate && newPTDY.endDate && newPTDY.label) {
      const days = differenceInDays(parseLocalDate(newPTDY.endDate), parseLocalDate(newPTDY.startDate)) + 1;
      if (days > remainingPTDYDays) {
        alert(`You only have ${remainingPTDYDays} PTDY days remaining. This block is ${days} days.`);
        return;
      }
      setFormData(prev => ({
        ...prev,
        ptdyBlocks: [...prev.ptdyBlocks, { ...newPTDY, id: Date.now() }]
      }));
      setNewPTDY({ startDate: '', endDate: '', label: '' });
    }
  };

  const removePTDY = (id) => {
    setFormData(prev => ({
      ...prev,
      ptdyBlocks: prev.ptdyBlocks.filter(block => block.id !== id)
    }));
    setEditingPTDY(null);
  };

  const updatePTDY = (id, updatedBlock) => {
    setFormData(prev => ({
      ...prev,
      ptdyBlocks: prev.ptdyBlocks.map(block => 
        block.id === id ? { ...block, ...updatedBlock } : block
      )
    }));
    setEditingPTDY(null);
  };

  const totalDaysRemaining = differenceInDays(parseLocalDate(formData.separationDate), parseLocalDate(formData.todayDate));

  const timelineBlocks = useMemo(() => {
    const blocks = [];
    const startDate = parseLocalDate(formData.todayDate);
    const endDate = parseLocalDate(formData.separationDate);
    const totalDays = differenceInDays(endDate, startDate);

    formData.skillbridge.forEach(sb => {
      const sbStart = parseLocalDate(sb.startDate);
      const sbEnd = parseLocalDate(sb.endDate);
      const offsetStart = differenceInDays(sbStart, startDate);
      const duration = differenceInDays(sbEnd, sbStart) + 1;
      blocks.push({
        type: 'skillbridge',
        label: sb.label,
        offsetPercent: (offsetStart / totalDays) * 100,
        widthPercent: (duration / totalDays) * 100,
        startDate: sb.startDate,
        endDate: sb.endDate
      });
    });

    formData.plannedLeave.forEach(leave => {
      const leaveStart = parseLocalDate(leave.startDate);
      const leaveEnd = parseLocalDate(leave.endDate);
      const offsetStart = differenceInDays(leaveStart, startDate);
      const duration = differenceInDays(leaveEnd, leaveStart) + 1;
      blocks.push({
        type: 'leave',
        label: leave.label,
        offsetPercent: (offsetStart / totalDays) * 100,
        widthPercent: (duration / totalDays) * 100,
        startDate: leave.startDate,
        endDate: leave.endDate
      });
    });

    if (ptdyDays > 0) {
      const ptdyStart = addDays(endDate, -ptdyDays);
      const offsetStart = differenceInDays(ptdyStart, startDate);
      blocks.push({
        type: 'ptdy',
        label: `PTDY (${ptdyDays} days)`,
        offsetPercent: (offsetStart / totalDays) * 100,
        widthPercent: (ptdyDays / totalDays) * 100,
        startDate: format(ptdyStart, 'yyyy-MM-dd'),
        endDate: formData.separationDate
      });
    }

    return blocks;
  }, [formData.skillbridge, formData.plannedLeave, formData.todayDate, formData.separationDate, ptdyDays]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-military-navy-light rounded-lg shadow-2xl p-8 border-2 border-military-amber">
        <div className="flex items-center mb-6">
          <Calendar className="w-8 h-8 text-military-amber mr-3" />
          <h2 className="text-3xl font-display text-military-amber uppercase tracking-wider">
            Timeline Planner
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-military-navy p-4 rounded-lg border border-military-olive">
            <div className="text-sm text-gray-400 mb-1">Days Remaining</div>
            <div className="text-3xl font-bold text-white">{totalDaysRemaining}</div>
          </div>
          <div className="bg-military-navy p-4 rounded-lg border border-military-olive">
            <div className="text-sm text-gray-400 mb-1">Current Leave Balance</div>
            <div className="text-3xl font-bold text-white">{formData.currentLeave}</div>
          </div>
          <div className="bg-military-navy p-4 rounded-lg border border-military-olive">
            <div className="text-sm text-gray-400 mb-1">Projected Leave at Separation</div>
            <div className="text-3xl font-bold text-military-amber">{projectedLeave.toFixed(1)}</div>
          </div>
          <div className={`p-4 rounded-lg border-2 ${
            totalTransitionDays.totalDays > 180 
              ? 'bg-red-900/30 border-red-500' 
              : totalTransitionDays.totalDays > 0 
                ? 'bg-blue-900/30 border-blue-500' 
                : 'bg-military-navy border-military-olive'
          }`}>
            <div className="text-sm text-gray-400 mb-1">Total Transition Days</div>
            <div className={`text-3xl font-bold ${
              totalTransitionDays.totalDays > 180 ? 'text-red-400' : 'text-blue-400'
            }`}>
              {totalTransitionDays.totalDays}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              SB: {totalTransitionDays.skillbridgeDays} + PTDY: {totalTransitionDays.ptdyDays} + TrL: {totalTransitionDays.transitionLeaveDays || 0} + TL: {totalTransitionDays.terminalLeaveDays}
            </div>
            <div className={`text-xs mt-1 ${
              totalTransitionDays.totalDays > 180 ? 'text-red-400' : 'text-gray-500'
            }`}>
              Max: 180 days
            </div>
          </div>
        </div>

        {!validation.isValid && (
          <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-4 mb-6 flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <div className="font-bold text-red-400 mb-1">Error: Negative Leave Balance</div>
              <div className="text-red-300">{validation.message}</div>
            </div>
          </div>
        )}

        {transitionLimitWarnings.length > 0 && (
          <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-start mb-2">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
              <div className="font-bold text-red-400">CRITICAL: 180-Day Transition Limit Exceeded</div>
            </div>
            {transitionLimitWarnings.map((warning, idx) => (
              <div key={idx} className="text-red-300 ml-9 mb-3">
                {warning.message}
              </div>
            ))}
            <div className="text-red-200 ml-9 text-sm">
              <strong>Required Actions:</strong>
              <ul className="list-disc ml-5 mt-1">
                <li>Reduce Skillbridge duration or remove programs</li>
                <li>Reduce scheduled PTDY days</li>
                <li>Sell back more leave to reduce terminal leave days</li>
              </ul>
            </div>
          </div>
        )}

        {octoberWarnings.length > 0 && (
          <div className="bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-4 mb-6">
            <div className="flex items-start mb-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0" />
              <div className="font-bold text-yellow-400">October 1st Leave Cap Warning</div>
            </div>
            {octoberWarnings.map((warning, idx) => (
              <div key={idx} className="text-yellow-300 ml-9 mb-2">
                {warning.message}
              </div>
            ))}
          </div>
        )}

        {totalPTDYDays > 0 && (
          <div className="bg-blue-900/30 border-2 border-blue-500 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Briefcase className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0" />
              <div>
                <div className="font-bold text-blue-400 mb-2">PTDY Status Information</div>
                <div className="text-blue-300 space-y-1">
                  <p>• <strong>Skillbridge participants are in PTDY status</strong> - not regular duty and not consuming leave</p>
                  <p>• Total PTDY days: {totalPTDYDays} days 
                    ({formData.skillbridge.length > 0 ? `${formData.skillbridge.reduce((sum, sb) => sum + differenceInDays(new Date(sb.endDate), new Date(sb.startDate)) + 1, 0)} Skillbridge` : '0 Skillbridge'}
                    {formData.ptdyBlocks.length > 0 ? ` + ${formData.ptdyBlocks.reduce((sum, ptdy) => sum + differenceInDays(new Date(ptdy.endDate), new Date(ptdy.startDate)) + 1, 0)} scheduled PTDY` : ''})
                  </p>
                  <p>• <strong>You cannot be in two leave statuses at once</strong> - terminal leave must end before PTDY begins</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-military-amber" />
            Skillbridge Programs
          </h3>
          
          <div className="bg-military-navy p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newSkillbridge.startDate}
                  onChange={(e) => setNewSkillbridge(prev => ({ ...prev, startDate: e.target.value }))}
                  min={formData.todayDate}
                  max={formData.separationDate}
                  className="w-full px-3 py-2 bg-military-navy-light border border-military-olive rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-military-amber"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={newSkillbridge.endDate}
                  onChange={(e) => setNewSkillbridge(prev => ({ ...prev, endDate: e.target.value }))}
                  min={newSkillbridge.startDate || formData.todayDate}
                  max={formData.separationDate}
                  className="w-full px-3 py-2 bg-military-navy-light border border-military-olive rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-military-amber"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Program Name</label>
                <input
                  type="text"
                  placeholder="e.g., Amazon Apprenticeship"
                  value={newSkillbridge.label}
                  onChange={(e) => setNewSkillbridge(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full px-3 py-2 bg-military-navy-light border border-military-olive rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-military-amber"
                />
              </div>
              <button
                onClick={addSkillbridge}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>
          </div>

          {formData.skillbridge.length > 0 && (
            <div className="space-y-2">
              {formData.skillbridge.map(sb => {
                const days = differenceInDays(parseLocalDate(sb.endDate), parseLocalDate(sb.startDate)) + 1;
                const isEditing = editingSkillbridge === sb.id;
                
                if (isEditing) {
                  return (
                    <div key={sb.id} className="bg-military-navy p-3 rounded border-l-4 border-blue-500">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                          <input
                            type="date"
                            defaultValue={sb.startDate}
                            id={`edit-sb-start-${sb.id}`}
                            className="w-full px-2 py-1 bg-military-navy-light border border-military-olive rounded text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">End Date</label>
                          <input
                            type="date"
                            defaultValue={sb.endDate}
                            id={`edit-sb-end-${sb.id}`}
                            className="w-full px-2 py-1 bg-military-navy-light border border-military-olive rounded text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Program Name</label>
                          <input
                            type="text"
                            defaultValue={sb.label}
                            id={`edit-sb-label-${sb.id}`}
                            className="w-full px-2 py-1 bg-military-navy-light border border-military-olive rounded text-white text-sm"
                          />
                        </div>
                        <div className="flex gap-2 items-end">
                          <button
                            onClick={() => {
                              const startDate = document.getElementById(`edit-sb-start-${sb.id}`).value;
                              const endDate = document.getElementById(`edit-sb-end-${sb.id}`).value;
                              const label = document.getElementById(`edit-sb-label-${sb.id}`).value;
                              if (startDate && endDate && label) {
                                updateSkillbridge(sb.id, { startDate, endDate, label });
                              }
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSkillbridge(null)}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={sb.id} className="bg-military-navy p-3 rounded flex justify-between items-center border-l-4 border-blue-500">
                    <div className="text-white flex-1">
                      <span className="font-semibold">{sb.label}</span>
                      <span className="text-gray-400 ml-3 text-sm">
                        {format(parseLocalDate(sb.startDate), 'MMM d, yyyy')} - {format(parseLocalDate(sb.endDate), 'MMM d, yyyy')}
                      </span>
                      <span className="text-blue-400 ml-3 text-sm">({days} days)</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingSkillbridge(sb.id)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeSkillbridge(sb.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {formData.separationType === 'retiring' && maxPTDYDays > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-purple-400" />
              PTDY Scheduling (House Hunting / Job Search)
            </h3>
            
            <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-4 mb-4">
              <div className="text-purple-300 text-sm mb-2">
                <strong>Available PTDY:</strong> {remainingPTDYDays} of {maxPTDYDays} days remaining
              </div>
              <div className="text-purple-200 text-xs">
                Schedule your PTDY for house hunting or job search. PTDY cannot be taken during the final days before separation - it must be scheduled earlier in your transition timeline.
              </div>
            </div>
            
            <div className="bg-military-navy p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newPTDY.startDate}
                    onChange={(e) => setNewPTDY(prev => ({ ...prev, startDate: e.target.value }))}
                    min={formData.todayDate}
                    max={formData.separationDate}
                    className="w-full px-3 py-2 bg-military-navy-light border border-military-olive rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newPTDY.endDate}
                    onChange={(e) => setNewPTDY(prev => ({ ...prev, endDate: e.target.value }))}
                    min={newPTDY.startDate || formData.todayDate}
                    max={formData.separationDate}
                    className="w-full px-3 py-2 bg-military-navy-light border border-military-olive rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Purpose</label>
                  <input
                    type="text"
                    placeholder="e.g., House Hunting"
                    value={newPTDY.label}
                    onChange={(e) => setNewPTDY(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full px-3 py-2 bg-military-navy-light border border-military-olive rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  onClick={addPTDY}
                  disabled={remainingPTDYDays <= 0}
                  className={`px-4 py-2 rounded flex items-center justify-center transition-colors ${
                    remainingPTDYDays > 0
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add PTDY
                </button>
              </div>
            </div>

            {formData.ptdyBlocks.length > 0 && (
              <div className="space-y-2">
                {formData.ptdyBlocks.map(ptdy => {
                  const days = differenceInDays(parseLocalDate(ptdy.endDate), parseLocalDate(ptdy.startDate)) + 1;
                  const isEditing = editingPTDY === ptdy.id;
                  
                  if (isEditing) {
                    return (
                      <div key={ptdy.id} className="bg-military-navy p-3 rounded border-l-4 border-purple-500">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                            <input
                              type="date"
                              defaultValue={ptdy.startDate}
                              id={`edit-ptdy-start-${ptdy.id}`}
                              className="w-full px-2 py-1 bg-military-navy-light border border-military-olive rounded text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">End Date</label>
                            <input
                              type="date"
                              defaultValue={ptdy.endDate}
                              id={`edit-ptdy-end-${ptdy.id}`}
                              className="w-full px-2 py-1 bg-military-navy-light border border-military-olive rounded text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Purpose</label>
                            <input
                              type="text"
                              defaultValue={ptdy.label}
                              id={`edit-ptdy-label-${ptdy.id}`}
                              className="w-full px-2 py-1 bg-military-navy-light border border-military-olive rounded text-white text-sm"
                            />
                          </div>
                          <div className="flex gap-2 items-end">
                            <button
                              onClick={() => {
                                const startDate = document.getElementById(`edit-ptdy-start-${ptdy.id}`).value;
                                const endDate = document.getElementById(`edit-ptdy-end-${ptdy.id}`).value;
                                const label = document.getElementById(`edit-ptdy-label-${ptdy.id}`).value;
                                if (startDate && endDate && label) {
                                  updatePTDY(ptdy.id, { startDate, endDate, label });
                                }
                              }}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingPTDY(null)}
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={ptdy.id} className="bg-military-navy p-3 rounded flex justify-between items-center border-l-4 border-purple-500">
                      <div className="text-white flex-1">
                        <span className="font-semibold">{ptdy.label}</span>
                        <span className="text-gray-400 ml-3 text-sm">
                          {format(parseLocalDate(ptdy.startDate), 'MMM d, yyyy')} - {format(parseLocalDate(ptdy.endDate), 'MMM d, yyyy')}
                        </span>
                        <span className="text-purple-400 ml-3 text-sm">({days} days)</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingPTDY(ptdy.id)}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removePTDY(ptdy.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-military-amber" />
            Planned Leave Blocks
          </h3>
          
          <div className="bg-military-navy p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newLeaveBlock.startDate}
                  onChange={(e) => setNewLeaveBlock(prev => ({ ...prev, startDate: e.target.value }))}
                  min={formData.todayDate}
                  max={formData.separationDate}
                  className="w-full px-3 py-2 bg-military-navy-light border border-military-olive rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-military-amber"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={newLeaveBlock.endDate}
                  onChange={(e) => setNewLeaveBlock(prev => ({ ...prev, endDate: e.target.value }))}
                  min={newLeaveBlock.startDate || formData.todayDate}
                  max={formData.separationDate}
                  className="w-full px-3 py-2 bg-military-navy-light border border-military-olive rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-military-amber"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Label</label>
                <input
                  type="text"
                  placeholder="e.g., PCS Leave"
                  value={newLeaveBlock.label}
                  onChange={(e) => setNewLeaveBlock(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full px-3 py-2 bg-military-navy-light border border-military-olive rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-military-amber"
                />
              </div>
              <button
                onClick={addLeaveBlock}
                className="px-4 py-2 bg-military-amber hover:bg-military-amber-light text-military-navy font-semibold rounded flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="transition-checkbox"
                checked={newLeaveBlock.isTransition}
                onChange={(e) => setNewLeaveBlock(prev => ({ ...prev, isTransition: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-military-navy-light border-military-olive rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="transition-checkbox" className="ml-2 text-sm text-gray-300">
                Part of Transition (counts toward 180-day limit)
              </label>
            </div>
          </div>

          {formData.plannedLeave.length > 0 && (
            <div className="space-y-2">
              {formData.plannedLeave.map(leave => {
                const days = differenceInDays(parseLocalDate(leave.endDate), parseLocalDate(leave.startDate)) + 1;
                const isEditing = editingLeave === leave.id;
                
                if (isEditing) {
                  return (
                    <div key={leave.id} className="bg-military-navy p-3 rounded border-l-4 border-military-amber">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                          <input
                            type="date"
                            defaultValue={leave.startDate}
                            id={`edit-leave-start-${leave.id}`}
                            className="w-full px-2 py-1 bg-military-navy-light border border-military-olive rounded text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">End Date</label>
                          <input
                            type="date"
                            defaultValue={leave.endDate}
                            id={`edit-leave-end-${leave.id}`}
                            className="w-full px-2 py-1 bg-military-navy-light border border-military-olive rounded text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Label</label>
                          <input
                            type="text"
                            defaultValue={leave.label}
                            id={`edit-leave-label-${leave.id}`}
                            className="w-full px-2 py-1 bg-military-navy-light border border-military-olive rounded text-white text-sm"
                          />
                        </div>
                        <div className="flex gap-2 items-end">
                          <button
                            onClick={() => {
                              const startDate = document.getElementById(`edit-leave-start-${leave.id}`).value;
                              const endDate = document.getElementById(`edit-leave-end-${leave.id}`).value;
                              const label = document.getElementById(`edit-leave-label-${leave.id}`).value;
                              const isTransition = document.getElementById(`edit-leave-transition-${leave.id}`).checked;
                              if (startDate && endDate && label) {
                                updateLeaveBlock(leave.id, { startDate, endDate, label, isTransition });
                              }
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingLeave(null)}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`edit-leave-transition-${leave.id}`}
                          defaultChecked={leave.isTransition || false}
                          className="w-4 h-4 text-blue-600 bg-military-navy-light border-military-olive rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor={`edit-leave-transition-${leave.id}`} className="ml-2 text-sm text-gray-300">
                          Part of Transition (counts toward 180-day limit)
                        </label>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={leave.id} className="bg-military-navy p-3 rounded flex justify-between items-center border-l-4 border-military-amber">
                    <div className="text-white flex-1">
                      <span className="font-semibold">{leave.label}</span>
                      {leave.isTransition && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">Transition</span>
                      )}
                      <span className="text-gray-400 ml-3 text-sm">
                        {format(parseLocalDate(leave.startDate), 'MMM d, yyyy')} - {format(parseLocalDate(leave.endDate), 'MMM d, yyyy')}
                      </span>
                      <span className="text-military-amber ml-3 text-sm">({days} days)</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingLeave(leave.id)}
                        className="text-military-amber hover:text-yellow-300 transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeLeaveBlock(leave.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Visual Timeline</h3>
          <div className="bg-military-navy p-6 rounded-lg">
            <div className="relative h-32 bg-gray-800 rounded-lg overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1 bg-green-500 z-10">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-green-400 whitespace-nowrap">
                  Today
                </div>
              </div>

              {timelineBlocks.map((block, idx) => (
                <div
                  key={idx}
                  className={`absolute top-0 h-full ${
                    block.type === 'skillbridge' ? 'bg-blue-500/70' :
                    block.type === 'leave' ? 'bg-military-amber/70' :
                    block.type === 'ptdy' ? 'bg-purple-500/70' :
                    'bg-gray-500/70'
                  } border-l-2 border-r-2 ${
                    block.type === 'skillbridge' ? 'border-blue-300' :
                    block.type === 'leave' ? 'border-yellow-300' :
                    block.type === 'ptdy' ? 'border-purple-300' :
                    'border-gray-300'
                  }`}
                  style={{
                    left: `${block.offsetPercent}%`,
                    width: `${block.widthPercent}%`
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white truncate px-1">
                      {block.label}
                    </span>
                  </div>
                </div>
              ))}

              <div className="absolute right-0 top-0 h-full w-1 bg-red-500 z-10">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-red-400 whitespace-nowrap">
                  Separation
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span className="text-gray-300">Skillbridge</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-military-amber rounded mr-2"></div>
                <span className="text-gray-300">Planned Leave</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                <span className="text-gray-300">PTDY</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <GanttChart 
            formData={formData} 
            ptdyDays={ptdyDays}
            terminalLeaveStartDate={null}
            totalTransitionDays={totalTransitionDays}
          />
        </div>

        <div className="bg-military-navy p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Leave Balance After Planned Leave</div>
          <div className={`text-3xl font-bold ${leaveCalculation.finalBalance < 0 ? 'text-red-500' : 'text-military-amber'}`}>
            {leaveCalculation.finalBalance.toFixed(1)} days
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <button
            onClick={onBack}
            className="px-8 py-3 bg-military-olive hover:bg-gray-600 text-white font-bold uppercase tracking-wider rounded-md transition-colors duration-200"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!validation.isValid}
            className={`px-8 py-3 font-bold uppercase tracking-wider rounded-md transition-colors duration-200 shadow-lg ${
              validation.isValid
                ? 'bg-military-amber hover:bg-military-amber-light text-military-navy'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next: View Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2Timeline;
