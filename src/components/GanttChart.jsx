import React, { useMemo } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Calendar } from 'lucide-react';
import { parseLocalDate } from '../utils/calculations';

const GanttChart = ({ formData, ptdyDays, terminalLeaveStartDate, totalTransitionDays }) => {
  const ganttData = useMemo(() => {
    const startDate = parseLocalDate(formData.todayDate);
    const endDate = parseLocalDate(formData.separationDate);
    const totalDays = differenceInDays(endDate, startDate);

    const tasks = [];

    formData.skillbridge.forEach((sb, idx) => {
      const sbStart = parseLocalDate(sb.startDate);
      const sbEnd = parseLocalDate(sb.endDate);
      const offsetDays = differenceInDays(sbStart, startDate);
      const duration = differenceInDays(sbEnd, sbStart) + 1;
      
      tasks.push({
        id: `skillbridge-${idx}`,
        name: `${sb.label} (PTDY)`,
        type: 'Skillbridge PTDY',
        startDate: sb.startDate,
        endDate: sb.endDate,
        offsetDays,
        duration,
        color: 'bg-blue-500',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-100'
      });
    });

    formData.plannedLeave.forEach((leave, idx) => {
      const leaveStart = parseLocalDate(leave.startDate);
      const leaveEnd = parseLocalDate(leave.endDate);
      const offsetDays = differenceInDays(leaveStart, startDate);
      const duration = differenceInDays(leaveEnd, leaveStart) + 1;
      
      tasks.push({
        id: `leave-${idx}`,
        name: leave.label,
        type: 'Planned Leave',
        startDate: leave.startDate,
        endDate: leave.endDate,
        offsetDays,
        duration,
        color: 'bg-military-amber',
        borderColor: 'border-yellow-300',
        textColor: 'text-yellow-900'
      });
    });

    if (formData.ptdyBlocks && formData.ptdyBlocks.length > 0) {
      formData.ptdyBlocks.forEach((ptdy, idx) => {
        const ptdyStart = parseLocalDate(ptdy.startDate);
        const ptdyEnd = parseLocalDate(ptdy.endDate);
        const offsetDays = differenceInDays(ptdyStart, startDate);
        const duration = differenceInDays(ptdyEnd, ptdyStart) + 1;
        
        tasks.push({
          id: `ptdy-${idx}`,
          name: ptdy.label,
          type: 'Retirement PTDY',
          startDate: ptdy.startDate,
          endDate: ptdy.endDate,
          offsetDays,
          duration,
          color: 'bg-purple-500',
          borderColor: 'border-purple-300',
          textColor: 'text-purple-100'
        });
      });
    }

    if (terminalLeaveStartDate) {
      const termStart = parseLocalDate(terminalLeaveStartDate);
      const offsetDays = differenceInDays(termStart, startDate);
      const duration = differenceInDays(endDate, termStart) + 1;
      
      tasks.push({
        id: 'terminal',
        name: `Terminal Leave (${duration} days)`,
        type: 'Terminal Leave',
        startDate: format(termStart, 'yyyy-MM-dd'),
        endDate: formData.separationDate,
        offsetDays,
        duration,
        color: 'bg-green-500',
        borderColor: 'border-green-300',
        textColor: 'text-green-100'
      });
    }

    tasks.sort((a, b) => a.offsetDays - b.offsetDays);

    return { tasks, totalDays, startDate, endDate };
  }, [formData, ptdyDays, terminalLeaveStartDate]);

  const monthMarkers = useMemo(() => {
    const markers = [];
    const startDate = ganttData.startDate;
    const endDate = ganttData.endDate;
    
    let currentDate = new Date(startDate);
    currentDate.setDate(1);
    
    if (currentDate < startDate) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    while (currentDate <= endDate) {
      const offsetDays = differenceInDays(currentDate, startDate);
      const offsetPercent = (offsetDays / ganttData.totalDays) * 100;
      
      markers.push({
        date: new Date(currentDate),
        offsetPercent,
        label: format(currentDate, 'MMM yyyy')
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return markers;
  }, [ganttData.startDate, ganttData.endDate, ganttData.totalDays]);

  return (
    <div className="bg-military-navy rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="w-6 h-6 text-military-amber mr-2" />
          <h3 className="text-xl font-bold text-white">Gantt Chart</h3>
        </div>
        {totalTransitionDays && totalTransitionDays.totalDays > 0 && (
          <div className={`px-4 py-2 rounded-lg border-2 ${
            totalTransitionDays.totalDays > 180 
              ? 'bg-red-900/30 border-red-500' 
              : 'bg-blue-900/30 border-blue-500'
          }`}>
            <div className="text-xs text-gray-400">Total Transition</div>
            <div className={`text-lg font-bold ${
              totalTransitionDays.totalDays > 180 ? 'text-red-400' : 'text-blue-400'
            }`}>
              {totalTransitionDays.totalDays} days
            </div>
            <div className="text-xs text-gray-400">
              SB: {totalTransitionDays.skillbridgeDays} + PTDY: {totalTransitionDays.ptdyDays} + TrL: {totalTransitionDays.transitionLeaveDays || 0} + TL: {totalTransitionDays.terminalLeaveDays}
            </div>
            <div className={`text-xs ${
              totalTransitionDays.totalDays > 180 ? 'text-red-400 font-bold' : 'text-gray-500'
            }`}>
              {totalTransitionDays.totalDays > 180 ? `⚠️ Exceeds 180-day limit!` : 'Max: 180 days'}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="relative mb-6">
            <div className="h-8 bg-gray-800 rounded-t-lg relative">
              {monthMarkers.map((marker, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 h-full border-l border-gray-600"
                  style={{ left: `${marker.offsetPercent}%` }}
                >
                  <div className="absolute -top-1 left-1 text-xs text-gray-400 whitespace-nowrap">
                    {marker.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute left-0 top-8 h-1 bg-green-500 w-0.5 z-20">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-green-400 whitespace-nowrap font-semibold">
                Today
              </div>
            </div>

            <div className="absolute right-0 top-8 h-1 bg-red-500 w-0.5 z-20">
              <div className="absolute -top-6 right-0 text-xs text-red-400 whitespace-nowrap font-semibold">
                Separation
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {ganttData.tasks.map((task) => {
              const widthPercent = (task.duration / ganttData.totalDays) * 100;
              const offsetPercent = (task.offsetDays / ganttData.totalDays) * 100;

              return (
                <div key={task.id} className="flex items-center">
                  <div className="w-48 pr-4 flex-shrink-0">
                    <div className="text-sm font-semibold text-white truncate">{task.name}</div>
                    <div className="text-xs text-gray-400">{task.type}</div>
                  </div>

                  <div className="flex-1 relative h-12 bg-gray-800 rounded">
                    <div
                      className={`absolute top-1 h-10 ${task.color} ${task.borderColor} border-2 rounded shadow-lg flex items-center px-3`}
                      style={{
                        left: `${offsetPercent}%`,
                        width: `${widthPercent}%`,
                        minWidth: '60px'
                      }}
                    >
                      <div className="flex flex-col text-xs">
                        <span className={`font-semibold ${task.textColor}`}>
                          {format(parseLocalDate(task.startDate), 'MMM d')} - {format(parseLocalDate(task.endDate), 'MMM d')}
                        </span>
                        <span className={`${task.textColor} opacity-90`}>
                          {task.duration} days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {ganttData.tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No events planned yet. Add Skillbridge programs or leave blocks to see them on the Gantt chart.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-military-olive">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-gray-300">Skillbridge (PTDY Status)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-military-amber rounded mr-2"></div>
            <span className="text-gray-300">Planned Leave</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
            <span className="text-gray-300">Retirement PTDY</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-gray-300">Terminal Leave</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
