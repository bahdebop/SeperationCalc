import { differenceInDays, differenceInMonths, addDays, isBefore, startOfDay } from 'date-fns';

// Parse date string in local timezone to avoid timezone offset issues
export const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  
  // Split the date string and create date in local timezone
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const calculateMonthsRemaining = (fromDate, toDate) => {
  const months = differenceInMonths(toDate, fromDate);
  return Math.max(0, months);
};

export const calculateDaysRemaining = (fromDate, toDate) => {
  const days = differenceInDays(toDate, fromDate);
  return Math.max(0, days);
};

export const calculateProjectedLeave = (currentLeave, monthsRemaining, accrualRate) => {
  return currentLeave + (monthsRemaining * accrualRate);
};

export const calculatePTDY = (separationType, dutyStation) => {
  if (separationType === 'retiring') {
    return dutyStation === 'overseas' ? 30 : 20;
  }
  return 0;
};

export const calculateSellBackValue = (monthlyBasePay, daysToSellBack) => {
  return (monthlyBasePay / 30) * daysToSellBack;
};

export const calculateMaxSellBack = (maxCareerSellBack, previouslySoldDays) => {
  return Math.max(0, maxCareerSellBack - previouslySoldDays);
};

export const calculateLeaveBalance = (
  currentLeave,
  accrualRate,
  todayDate,
  separationDate,
  plannedLeaveBlocks
) => {
  const timeline = [];
  let runningBalance = currentLeave;
  let currentDate = startOfDay(parseLocalDate(todayDate));
  const endDate = startOfDay(parseLocalDate(separationDate));
  
  const monthsRemaining = calculateMonthsRemaining(currentDate, endDate);
  
  const sortedLeaveBlocks = [...plannedLeaveBlocks].sort(
    (a, b) => parseLocalDate(a.startDate) - parseLocalDate(b.startDate)
  );
  
  let monthCounter = 0;
  
  while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
    const dayData = {
      date: new Date(currentDate),
      balance: runningBalance,
      type: 'normal',
      label: ''
    };
    
    if (currentDate.getDate() === 1 && monthCounter < monthsRemaining) {
      runningBalance += accrualRate;
      dayData.accrued = accrualRate;
      monthCounter++;
    }
    
    const currentDateValue = currentDate.getTime();
    const activeLeaveBlock = sortedLeaveBlocks.find(block => {
      const blockStart = startOfDay(parseLocalDate(block.startDate));
      const blockEnd = startOfDay(parseLocalDate(block.endDate));
      return (currentDateValue >= blockStart.getTime() && currentDateValue <= blockEnd.getTime());
    });
    
    if (activeLeaveBlock) {
      runningBalance -= 1;
      dayData.type = 'leave';
      dayData.label = activeLeaveBlock.label;
      dayData.consumed = 1;
    }
    
    dayData.balance = runningBalance;
    timeline.push(dayData);
    
    currentDate = addDays(currentDate, 1);
  }
  
  return {
    timeline,
    finalBalance: runningBalance
  };
};

export const findOctoberFirstDates = (startDate, endDate) => {
  const dates = [];
  let currentYear = new Date(startDate).getFullYear();
  const endYear = new Date(endDate).getFullYear();
  
  while (currentYear <= endYear) {
    const oct1 = new Date(currentYear, 9, 1);
    if (oct1 >= startDate && oct1 <= endDate) {
      dates.push(oct1);
    }
    currentYear++;
  }
  
  return dates;
};

export const checkOctoberFirstWarnings = (timeline, octoberFirstDates) => {
  const warnings = [];
  
  octoberFirstDates.forEach(oct1Date => {
    const dayData = timeline.find(day => 
      startOfDay(day.date).getTime() === startOfDay(oct1Date).getTime()
    );
    
    if (dayData && dayData.balance > 60) {
      const excessDays = dayData.balance - 60;
      warnings.push({
        date: oct1Date,
        balance: dayData.balance,
        excessDays,
        message: `You will have ${dayData.balance} days on Oct 1st. You need to use ${excessDays} days before this date to avoid losing leave.`
      });
    }
  });
  
  return warnings;
};

export const calculateTotalPTDYDays = (separationType, dutyStation, skillbridgeBlocks, ptdyBlocks = []) => {
  const skillbridgeDays = skillbridgeBlocks.reduce((total, sb) => {
    const days = differenceInDays(parseLocalDate(sb.endDate), parseLocalDate(sb.startDate)) + 1;
    return total + days;
  }, 0);
  
  const ptdyDays = ptdyBlocks.reduce((total, ptdy) => {
    const days = differenceInDays(parseLocalDate(ptdy.endDate), parseLocalDate(ptdy.startDate)) + 1;
    return total + days;
  }, 0);
  
  return skillbridgeDays + ptdyDays;
};

export const getPTDYPeriods = (separationType, dutyStation, skillbridgeBlocks, separationDate, ptdyBlocks = []) => {
  const periods = [];
  
  skillbridgeBlocks.forEach(sb => {
    periods.push({
      type: 'Skillbridge PTDY',
      startDate: sb.startDate,
      endDate: sb.endDate,
      label: sb.label
    });
  });
  
  ptdyBlocks.forEach(ptdy => {
    periods.push({
      type: 'Retirement PTDY',
      startDate: ptdy.startDate,
      endDate: ptdy.endDate,
      label: ptdy.label
    });
  });
  
  return periods;
};

export const calculateOptimalSplit = (
  finalLeaveBalance,
  maxSellBack,
  separationDate,
  monthlyBasePay,
  ptdyPeriods = []
) => {
  const daysToSellBack = Math.min(finalLeaveBalance, maxSellBack);
  const terminalLeaveDays = finalLeaveBalance - daysToSellBack;
  const sellBackValue = calculateSellBackValue(monthlyBasePay, daysToSellBack);
  let terminalLeaveStartDate = addDays(new Date(separationDate), -terminalLeaveDays);
  
  const retirementPTDY = ptdyPeriods.find(p => p.type === 'Retirement PTDY');
  if (retirementPTDY && terminalLeaveDays > 0) {
    const ptdyStartDate = new Date(retirementPTDY.startDate);
    if (terminalLeaveStartDate >= ptdyStartDate) {
      terminalLeaveStartDate = addDays(ptdyStartDate, -1);
    }
  }
  
  return {
    terminalLeaveDays,
    daysToSellBack,
    sellBackValue,
    terminalLeaveStartDate
  };
};

export const checkForOverlaps = (skillbridgeBlocks, leaveBlocks, ptdyBlock, terminalLeaveBlock) => {
  const warnings = [];
  
  const blocksToCheck = [
    ...skillbridgeBlocks.map(sb => ({ ...sb, type: 'Skillbridge' })),
    ...leaveBlocks.map(lb => ({ ...lb, type: 'Leave' })),
  ];
  
  if (ptdyBlock) {
    blocksToCheck.push({ ...ptdyBlock, type: 'PTDY' });
  }
  
  if (terminalLeaveBlock) {
    blocksToCheck.push({ ...terminalLeaveBlock, type: 'Terminal Leave' });
  }
  
  for (let i = 0; i < blocksToCheck.length; i++) {
    for (let j = i + 1; j < blocksToCheck.length; j++) {
      const block1 = blocksToCheck[i];
      const block2 = blocksToCheck[j];
      
      const start1 = new Date(block1.startDate);
      const end1 = new Date(block1.endDate);
      const start2 = new Date(block2.startDate);
      const end2 = new Date(block2.endDate);
      
      const overlaps = (start1 <= end2 && end1 >= start2);
      
      if (overlaps) {
        warnings.push({
          type: 'overlap',
          message: `${block1.type} (${block1.label || ''}) overlaps with ${block2.type} (${block2.label || ''})`
        });
      }
    }
  }
  
  return warnings;
};

export const validateLeaveBalance = (timeline) => {
  const negativeBalances = timeline.filter(day => day.balance < 0);
  
  if (negativeBalances.length > 0) {
    return {
      isValid: false,
      message: 'Leave balance goes negative. You have over-planned your leave.',
      firstNegativeDate: negativeBalances[0].date
    };
  }
  
  return { isValid: true };
};

export const calculateTotalTransitionDays = (skillbridgeBlocks, ptdyBlocks, terminalLeaveDays, plannedLeave = []) => {
  const skillbridgeDays = skillbridgeBlocks.reduce((total, sb) => {
    const days = differenceInDays(parseLocalDate(sb.endDate), parseLocalDate(sb.startDate)) + 1;
    return total + days;
  }, 0);
  
  const ptdyDays = ptdyBlocks.reduce((total, ptdy) => {
    const days = differenceInDays(parseLocalDate(ptdy.endDate), parseLocalDate(ptdy.startDate)) + 1;
    return total + days;
  }, 0);
  
  const transitionLeaveDays = plannedLeave
    .filter(leave => leave.isTransition)
    .reduce((total, leave) => {
      const days = differenceInDays(parseLocalDate(leave.endDate), parseLocalDate(leave.startDate)) + 1;
      return total + days;
    }, 0);
  
  return {
    skillbridgeDays,
    ptdyDays,
    terminalLeaveDays,
    transitionLeaveDays,
    totalDays: skillbridgeDays + ptdyDays + terminalLeaveDays + transitionLeaveDays
  };
};

export const validateTransitionLimit = (totalTransitionDays, maxLimit = 180) => {
  const warnings = [];
  
  if (totalTransitionDays > maxLimit) {
    const excessDays = totalTransitionDays - maxLimit;
    warnings.push({
      type: 'transition_limit',
      severity: 'error',
      message: `Total transition time (Skillbridge + PTDY + Terminal Leave) is ${totalTransitionDays} days, which exceeds the ${maxLimit}-day limit by ${excessDays} days. You must reduce your Skillbridge, PTDY, or terminal leave.`
    });
  }
  
  return warnings;
};

export const validatePTDYTerminalLeave = (terminalLeaveStartDate, separationDate, ptdyPeriods) => {
  const warnings = [];
  const termStart = parseLocalDate(terminalLeaveStartDate);
  const sepDate = parseLocalDate(separationDate);
  
  const retirementPTDY = ptdyPeriods.find(p => p.type === 'Retirement PTDY');
  if (retirementPTDY) {
    const ptdyStart = parseLocalDate(retirementPTDY.startDate);
    const ptdyEnd = parseLocalDate(retirementPTDY.endDate);
    
    if (termStart <= ptdyEnd && termStart >= ptdyStart) {
      warnings.push({
        type: 'ptdy_overlap',
        severity: 'error',
        message: 'Terminal leave cannot overlap with PTDY. You must end your service in Leave status, not PTDY status. Terminal leave must end before PTDY begins.'
      });
    }
  }
  
  ptdyPeriods.forEach(period => {
    if (period.type === 'Skillbridge PTDY') {
      const sbStart = parseLocalDate(period.startDate);
      const sbEnd = parseLocalDate(period.endDate);
      
      if ((termStart <= sbEnd && termStart >= sbStart) || (sepDate <= sbEnd && sepDate >= sbStart)) {
        warnings.push({
          type: 'skillbridge_overlap',
          severity: 'error',
          message: `Terminal leave cannot overlap with Skillbridge (${period.label}). While on Skillbridge, you are in PTDY status.`
        });
      }
    }
  });
  
  return warnings;
};
