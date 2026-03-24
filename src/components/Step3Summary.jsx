import React, { useMemo } from 'react';
import { CheckCircle, AlertTriangle, DollarSign, Calendar, TrendingUp, Award, Download, Printer, FileJson } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import GanttChart from './GanttChart';
import { generatePlanHTML, exportToPrint, exportToHTML, exportToJSON } from '../utils/exportPlan';
import {
  calculateMonthsRemaining,
  calculateProjectedLeave,
  calculateLeaveBalance,
  calculateOptimalSplit,
  calculateMaxSellBack,
  findOctoberFirstDates,
  checkOctoberFirstWarnings,
  calculatePTDY,
  getPTDYPeriods,
  validatePTDYTerminalLeave,
  calculateTotalPTDYDays,
  calculateTotalTransitionDays,
  validateTransitionLimit,
  parseLocalDate
} from '../utils/calculations';

const Step3Summary = ({ formData, onBack, onRestart }) => {
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

  const maxSellBack = useMemo(() => {
    return calculateMaxSellBack(formData.maxSellBack, formData.previouslySoldDays);
  }, [formData.maxSellBack, formData.previouslySoldDays]);

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

  const optimalSplit = useMemo(() => {
    return calculateOptimalSplit(
      leaveCalculation.finalBalance,
      maxSellBack,
      formData.separationDate,
      formData.monthlyBasePay,
      ptdyPeriods
    );
  }, [leaveCalculation.finalBalance, maxSellBack, formData.separationDate, formData.monthlyBasePay, ptdyPeriods]);

  const ptdyValidationWarnings = useMemo(() => {
    if (optimalSplit.terminalLeaveDays > 0) {
      return validatePTDYTerminalLeave(
        optimalSplit.terminalLeaveStartDate,
        formData.separationDate,
        ptdyPeriods
      );
    }
    return [];
  }, [optimalSplit.terminalLeaveStartDate, optimalSplit.terminalLeaveDays, formData.separationDate, ptdyPeriods]);

  const octoberFirstDates = useMemo(() => {
    return findOctoberFirstDates(parseLocalDate(formData.todayDate), parseLocalDate(formData.separationDate));
  }, [formData.todayDate, formData.separationDate]);

  const octoberWarnings = useMemo(() => {
    return checkOctoberFirstWarnings(leaveCalculation.timeline, octoberFirstDates);
  }, [leaveCalculation.timeline, octoberFirstDates]);

  const totalPlannedLeaveDays = formData.plannedLeave.reduce((sum, leave) => {
    return sum + differenceInDays(parseLocalDate(leave.endDate), parseLocalDate(leave.startDate)) + 1;
  }, 0);

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

  const totalDaysRemaining = differenceInDays(parseLocalDate(formData.separationDate), parseLocalDate(formData.todayDate));
  const isOnTrack = leaveCalculation.finalBalance >= 0 && octoberWarnings.length === 0 && ptdyValidationWarnings.length === 0 && transitionLimitWarnings.length === 0;
  const willForfeitLeave = leaveCalculation.finalBalance > (maxSellBack + 60);

  const handleExportHTML = () => {
    const htmlContent = generatePlanHTML(formData, {
      projectedLeave,
      leaveCalculation,
      optimalSplit,
      monthsRemaining,
      totalPlannedLeaveDays,
      ptdyDays,
      octoberWarnings
    });
    exportToHTML(htmlContent, `transition-plan-${format(new Date(), 'yyyy-MM-dd')}.html`);
  };

  const handlePrint = () => {
    const htmlContent = generatePlanHTML(formData, {
      projectedLeave,
      leaveCalculation,
      optimalSplit,
      monthsRemaining,
      totalPlannedLeaveDays,
      ptdyDays,
      octoberWarnings
    });
    exportToPrint(htmlContent);
  };

  const handleExportJSON = () => {
    exportToJSON(formData, `transition-plan-${format(new Date(), 'yyyy-MM-dd')}.json`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-military-navy-light rounded-lg shadow-2xl p-8 border-2 border-military-amber">
        <div className="flex items-center mb-6">
          <Award className="w-8 h-8 text-military-amber mr-3" />
          <h2 className="text-3xl font-display text-military-amber uppercase tracking-wider">
            Transition Summary
          </h2>
        </div>

        <div className={`mb-8 p-6 rounded-lg border-2 ${
          isOnTrack ? 'bg-green-900/30 border-green-500' : 'bg-yellow-900/30 border-yellow-500'
        }`}>
          <div className="flex items-center mb-2">
            {isOnTrack ? (
              <CheckCircle className="w-8 h-8 text-green-400 mr-3" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-yellow-400 mr-3" />
            )}
            <h3 className={`text-2xl font-bold ${isOnTrack ? 'text-green-400' : 'text-yellow-400'}`}>
              {isOnTrack ? 'ON TRACK' : 'ACTION REQUIRED'}
            </h3>
          </div>
          <p className={`text-lg ${isOnTrack ? 'text-green-300' : 'text-yellow-300'}`}>
            {isOnTrack 
              ? 'Your transition plan is optimized. All leave is accounted for with no forfeitures.'
              : 'Review the warnings below and adjust your leave planning accordingly.'}
          </p>
        </div>

        <div className="mb-8 bg-military-navy p-6 rounded-lg border-2 border-military-amber">
          <h3 className="text-xl font-bold text-white mb-4">Export & Share</h3>
          <p className="text-gray-300 mb-4">Save your transition plan to share with leadership or keep for your records.</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors duration-200"
            >
              <Printer className="w-5 h-5 mr-2" />
              Print Plan
            </button>
            <button
              onClick={handleExportHTML}
              className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors duration-200"
            >
              <Download className="w-5 h-5 mr-2" />
              Download HTML
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition-colors duration-200"
            >
              <FileJson className="w-5 h-5 mr-2" />
              Save as JSON
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-military-navy p-6 rounded-lg border-2 border-military-olive">
            <div className="flex items-center mb-3">
              <Calendar className="w-6 h-6 text-military-amber mr-2" />
              <h4 className="text-sm font-semibold text-gray-400 uppercase">Days Until Separation</h4>
            </div>
            <div className="text-4xl font-bold text-white">{totalDaysRemaining}</div>
            <div className="text-sm text-gray-400 mt-2">
              {format(new Date(formData.separationDate), 'MMMM d, yyyy')}
            </div>
          </div>

          <div className="bg-military-navy p-6 rounded-lg border-2 border-military-olive">
            <div className="flex items-center mb-3">
              <TrendingUp className="w-6 h-6 text-blue-400 mr-2" />
              <h4 className="text-sm font-semibold text-gray-400 uppercase">Projected Leave Balance</h4>
            </div>
            <div className="text-4xl font-bold text-blue-400">{projectedLeave.toFixed(1)}</div>
            <div className="text-sm text-gray-400 mt-2">
              Before planned leave
            </div>
          </div>

          <div className="bg-military-navy p-6 rounded-lg border-2 border-military-olive">
            <div className="flex items-center mb-3">
              <Calendar className="w-6 h-6 text-purple-400 mr-2" />
              <h4 className="text-sm font-semibold text-gray-400 uppercase">Planned Leave Days</h4>
            </div>
            <div className="text-4xl font-bold text-purple-400">{totalPlannedLeaveDays}</div>
            <div className="text-sm text-gray-400 mt-2">
              {formData.plannedLeave.length} leave block(s)
            </div>
          </div>

          <div className="bg-military-navy p-6 rounded-lg border-2 border-military-amber">
            <div className="flex items-center mb-3">
              <Calendar className="w-6 h-6 text-military-amber mr-2" />
              <h4 className="text-sm font-semibold text-gray-400 uppercase">Terminal Leave</h4>
            </div>
            <div className="text-4xl font-bold text-military-amber">{optimalSplit.terminalLeaveDays.toFixed(1)}</div>
            <div className="text-sm text-gray-400 mt-2">
              Starts {format(optimalSplit.terminalLeaveStartDate, 'MMM d, yyyy')}
            </div>
          </div>

          <div className="bg-military-navy p-6 rounded-lg border-2 border-green-500">
            <div className="flex items-center mb-3">
              <DollarSign className="w-6 h-6 text-green-400 mr-2" />
              <h4 className="text-sm font-semibold text-gray-400 uppercase">Recommended Sell-Back</h4>
            </div>
            <div className="text-4xl font-bold text-green-400">{optimalSplit.daysToSellBack.toFixed(1)}</div>
            <div className="text-sm text-gray-400 mt-2">
              days (max: {maxSellBack})
            </div>
          </div>

          <div className="bg-military-navy p-6 rounded-lg border-2 border-green-500">
            <div className="flex items-center mb-3">
              <DollarSign className="w-6 h-6 text-green-400 mr-2" />
              <h4 className="text-sm font-semibold text-gray-400 uppercase">Estimated Sell-Back Value</h4>
            </div>
            <div className="text-3xl font-bold text-green-400">
              ${optimalSplit.sellBackValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Based on ${formData.monthlyBasePay.toLocaleString()}/mo
            </div>
          </div>
        </div>

        {willForfeitLeave && (
          <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <AlertTriangle className="w-8 h-8 text-red-400 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-xl font-bold text-red-400 mb-2">Leave Will Be Forfeited</h4>
                <p className="text-red-300 mb-3">
                  You have more leave than can be used as terminal leave or sold back. 
                  Approximately {(leaveCalculation.finalBalance - maxSellBack - 60).toFixed(1)} days will be forfeited.
                </p>
                <p className="text-red-300">
                  <strong>Action Required:</strong> Add more planned leave blocks before your separation date to avoid losing this leave.
                </p>
              </div>
            </div>
          </div>
        )}

        {octoberWarnings.length > 0 && (
          <div className="bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-6 mb-8">
            <div className="flex items-start mb-3">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mr-3 flex-shrink-0" />
              <h4 className="text-xl font-bold text-yellow-400">October 1st Leave Cap Warnings</h4>
            </div>
            <div className="space-y-3">
              {octoberWarnings.map((warning, idx) => (
                <div key={idx} className="bg-yellow-900/20 p-4 rounded">
                  <div className="text-yellow-300 font-semibold mb-1">
                    {format(warning.date, 'MMMM d, yyyy')}
                  </div>
                  <div className="text-yellow-200">
                    {warning.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ptdyValidationWarnings.length > 0 && (
          <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-6 mb-8">
            <div className="flex items-start mb-3">
              <AlertTriangle className="w-8 h-8 text-red-400 mr-3 flex-shrink-0" />
              <h4 className="text-xl font-bold text-red-400">CRITICAL: Leave Status Conflict</h4>
            </div>
            <div className="space-y-3">
              {ptdyValidationWarnings.map((warning, idx) => (
                <div key={idx} className="bg-red-900/20 p-4 rounded">
                  <div className="text-red-300 font-semibold mb-2">
                    {warning.type === 'ptdy_overlap' ? '⚠️ Terminal Leave / PTDY Overlap' : '⚠️ Terminal Leave / Skillbridge Overlap'}
                  </div>
                  <div className="text-red-200 mb-3">
                    {warning.message}
                  </div>
                  <div className="text-red-300 text-sm">
                    <strong>Required Action:</strong> You must either:
                    <ul className="list-disc ml-5 mt-1">
                      <li>Take more planned leave before PTDY begins, OR</li>
                      <li>Sell back additional leave days to reduce terminal leave duration</li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {transitionLimitWarnings.length > 0 && (
          <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-6 mb-8">
            <div className="flex items-start mb-3">
              <AlertTriangle className="w-8 h-8 text-red-400 mr-3 flex-shrink-0" />
              <h4 className="text-xl font-bold text-red-400">CRITICAL: 180-Day Transition Limit Exceeded</h4>
            </div>
            <div className="space-y-3">
              {transitionLimitWarnings.map((warning, idx) => (
                <div key={idx} className="bg-red-900/20 p-4 rounded">
                  <div className="text-red-200 mb-3">
                    {warning.message}
                  </div>
                  <div className="text-red-300 text-sm">
                    <strong>Required Actions:</strong>
                    <ul className="list-disc ml-5 mt-1">
                      <li>Reduce Skillbridge duration or remove programs</li>
                      <li>Reduce scheduled PTDY days</li>
                      <li>Sell back more leave to reduce terminal leave days</li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <GanttChart 
            formData={formData} 
            ptdyDays={ptdyDays}
            terminalLeaveStartDate={optimalSplit.terminalLeaveStartDate}
            totalTransitionDays={totalTransitionDays}
          />
        </div>

        <div className="bg-military-navy rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Leave Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-military-olive">
              <span className="text-gray-300">Current Leave Balance</span>
              <span className="text-white font-semibold">{formData.currentLeave} days</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-military-olive">
              <span className="text-gray-300">Leave to Accrue ({monthsRemaining} months)</span>
              <span className="text-white font-semibold">+{(monthsRemaining * formData.accrualRate).toFixed(1)} days</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-military-olive">
              <span className="text-gray-300">Projected Total</span>
              <span className="text-blue-400 font-semibold">{projectedLeave.toFixed(1)} days</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-military-olive">
              <span className="text-gray-300">Planned Leave Usage</span>
              <span className="text-purple-400 font-semibold">-{totalPlannedLeaveDays} days</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-military-olive">
              <span className="text-gray-300">Balance After Planned Leave</span>
              <span className={`font-semibold ${leaveCalculation.finalBalance < 0 ? 'text-red-400' : 'text-white'}`}>
                {leaveCalculation.finalBalance.toFixed(1)} days
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-military-olive">
              <span className="text-gray-300">Terminal Leave</span>
              <span className="text-military-amber font-semibold">{optimalSplit.terminalLeaveDays.toFixed(1)} days</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">Leave to Sell Back</span>
              <span className="text-green-400 font-semibold">{optimalSplit.daysToSellBack.toFixed(1)} days</span>
            </div>
          </div>
        </div>

        {formData.skillbridge.length > 0 && (
          <div className="bg-military-navy rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Skillbridge Programs</h3>
            <div className="space-y-2">
              {formData.skillbridge.map((sb, idx) => {
                const days = differenceInDays(new Date(sb.endDate), new Date(sb.startDate)) + 1;
                return (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-military-olive">
                    <span className="text-gray-300">{sb.label}</span>
                    <span className="text-blue-400 font-semibold">
                      {format(new Date(sb.startDate), 'MMM d')} - {format(new Date(sb.endDate), 'MMM d, yyyy')} ({days} days)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-military-navy rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Key Dates</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-military-olive">
              <span className="text-gray-300">Today</span>
              <span className="text-white font-semibold">{format(new Date(formData.todayDate), 'MMMM d, yyyy')}</span>
            </div>
            {optimalSplit.terminalLeaveStartDate && (
              <div className="flex justify-between items-center py-2 border-b border-military-olive">
                <span className="text-gray-300">Terminal Leave Starts</span>
                <span className="text-military-amber font-semibold">
                  {format(optimalSplit.terminalLeaveStartDate, 'MMMM d, yyyy')}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">Separation/Retirement Date</span>
              <span className="text-red-400 font-semibold">{format(new Date(formData.separationDate), 'MMMM d, yyyy')}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <button
            onClick={onBack}
            className="px-8 py-3 bg-military-olive hover:bg-gray-600 text-white font-bold uppercase tracking-wider rounded-md transition-colors duration-200"
          >
            Back to Timeline
          </button>
          <button
            onClick={onRestart}
            className="px-8 py-3 bg-military-amber hover:bg-military-amber-light text-military-navy font-bold uppercase tracking-wider rounded-md transition-colors duration-200 shadow-lg"
          >
            Start New Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3Summary;
