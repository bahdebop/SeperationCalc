import { format, differenceInDays } from 'date-fns';

export const generatePlanHTML = (formData, calculations) => {
  const { 
    projectedLeave, 
    leaveCalculation, 
    optimalSplit, 
    monthsRemaining,
    totalPlannedLeaveDays,
    ptdyDays,
    octoberWarnings 
  } = calculations;

  const totalDaysRemaining = differenceInDays(
    new Date(formData.separationDate), 
    new Date(formData.todayDate)
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Military Transition Plan - ${format(new Date(), 'yyyy-MM-dd')}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #fff;
    }
    .header {
      text-align: center;
      border-bottom: 4px solid #1a2332;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #1a2332;
      font-size: 32px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .header .subtitle {
      color: #666;
      font-size: 16px;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      background: #1a2332;
      color: #d69e2e;
      padding: 12px 20px;
      font-size: 20px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .info-card {
      border: 2px solid #e0e0e0;
      padding: 15px;
      border-radius: 5px;
    }
    .info-card .label {
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 5px;
      font-weight: bold;
    }
    .info-card .value {
      color: #1a2332;
      font-size: 24px;
      font-weight: bold;
    }
    .info-card .subvalue {
      color: #999;
      font-size: 14px;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    th {
      background: #f5f5f5;
      font-weight: bold;
      color: #1a2332;
      text-transform: uppercase;
      font-size: 12px;
    }
    .warning-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin-bottom: 15px;
    }
    .warning-box strong {
      color: #856404;
    }
    .success-box {
      background: #d4edda;
      border-left: 4px solid #28a745;
      padding: 15px;
      margin-bottom: 15px;
    }
    .success-box strong {
      color: #155724;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    .timeline-item {
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .timeline-item:last-child {
      border-bottom: none;
    }
    .timeline-type {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      margin-right: 10px;
    }
    .type-skillbridge { background: #007bff; color: white; }
    .type-leave { background: #d69e2e; color: #1a2332; }
    .type-ptdy { background: #6f42c1; color: white; }
    .type-terminal { background: #28a745; color: white; }
    @media print {
      body { padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🛡️ Military Transition Plan</h1>
    <div class="subtitle">Generated on ${format(new Date(), 'MMMM d, yyyy')}</div>
  </div>

  <div class="section">
    <div class="section-title">Member Information</div>
    <div class="info-grid">
      <div class="info-card">
        <div class="label">Separation Type</div>
        <div class="value">${formData.separationType === 'retiring' ? 'Retiring' : 'Separating'}</div>
      </div>
      <div class="info-card">
        <div class="label">Duty Station</div>
        <div class="value">${formData.dutyStation === 'overseas' ? 'Overseas' : 'Stateside'}</div>
      </div>
      <div class="info-card">
        <div class="label">Separation Date</div>
        <div class="value">${format(new Date(formData.separationDate), 'MMM d, yyyy')}</div>
      </div>
      <div class="info-card">
        <div class="label">Days Remaining</div>
        <div class="value">${totalDaysRemaining}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Leave Summary</div>
    ${octoberWarnings.length === 0 && leaveCalculation.finalBalance >= 0 ? `
      <div class="success-box">
        <strong>✓ ON TRACK:</strong> Your transition plan is optimized. All leave is accounted for with no forfeitures.
      </div>
    ` : ''}
    ${octoberWarnings.length > 0 ? `
      <div class="warning-box">
        <strong>⚠ ACTION REQUIRED:</strong> October 1st leave cap warnings detected. Review planned leave to avoid forfeiture.
      </div>
    ` : ''}
    <div class="info-grid">
      <div class="info-card">
        <div class="label">Current Leave Balance</div>
        <div class="value">${formData.currentLeave}</div>
        <div class="subvalue">days</div>
      </div>
      <div class="info-card">
        <div class="label">Leave to Accrue</div>
        <div class="value">+${(monthsRemaining * formData.accrualRate).toFixed(1)}</div>
        <div class="subvalue">${monthsRemaining} months @ ${formData.accrualRate}/mo</div>
      </div>
      <div class="info-card">
        <div class="label">Projected Total</div>
        <div class="value">${projectedLeave.toFixed(1)}</div>
        <div class="subvalue">days</div>
      </div>
      <div class="info-card">
        <div class="label">Planned Leave Usage</div>
        <div class="value">-${totalPlannedLeaveDays}</div>
        <div class="subvalue">days</div>
      </div>
      <div class="info-card">
        <div class="label">Balance After Planned Leave</div>
        <div class="value">${leaveCalculation.finalBalance.toFixed(1)}</div>
        <div class="subvalue">days</div>
      </div>
      <div class="info-card">
        <div class="label">Terminal Leave</div>
        <div class="value">${optimalSplit.terminalLeaveDays.toFixed(1)}</div>
        <div class="subvalue">Starts ${format(optimalSplit.terminalLeaveStartDate, 'MMM d, yyyy')}</div>
      </div>
      <div class="info-card">
        <div class="label">Recommended Sell-Back</div>
        <div class="value">${optimalSplit.daysToSellBack.toFixed(1)}</div>
        <div class="subvalue">days</div>
      </div>
      <div class="info-card">
        <div class="label">Sell-Back Value</div>
        <div class="value">$${optimalSplit.sellBackValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div class="subvalue">Based on $${formData.monthlyBasePay.toLocaleString()}/mo</div>
      </div>
    </div>
  </div>

  ${formData.skillbridge.length > 0 ? `
    <div class="section">
      <div class="section-title">Skillbridge Programs</div>
      <table>
        <thead>
          <tr>
            <th>Program Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${formData.skillbridge.map(sb => {
            const duration = differenceInDays(new Date(sb.endDate), new Date(sb.startDate)) + 1;
            return `
              <tr>
                <td>${sb.label}</td>
                <td>${format(new Date(sb.startDate), 'MMM d, yyyy')}</td>
                <td>${format(new Date(sb.endDate), 'MMM d, yyyy')}</td>
                <td>${duration} days</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  ` : ''}

  ${formData.plannedLeave.length > 0 ? `
    <div class="section">
      <div class="section-title">Planned Leave Blocks</div>
      <table>
        <thead>
          <tr>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${formData.plannedLeave.map(leave => {
            const duration = differenceInDays(new Date(leave.endDate), new Date(leave.startDate)) + 1;
            return `
              <tr>
                <td>${leave.label}</td>
                <td>${format(new Date(leave.startDate), 'MMM d, yyyy')}</td>
                <td>${format(new Date(leave.endDate), 'MMM d, yyyy')}</td>
                <td>${duration} days</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Timeline Overview</div>
    ${formData.skillbridge.map(sb => `
      <div class="timeline-item">
        <span class="timeline-type type-skillbridge">Skillbridge</span>
        <strong>${sb.label}</strong> - ${format(new Date(sb.startDate), 'MMM d, yyyy')} to ${format(new Date(sb.endDate), 'MMM d, yyyy')}
      </div>
    `).join('')}
    ${formData.plannedLeave.map(leave => `
      <div class="timeline-item">
        <span class="timeline-type type-leave">Leave</span>
        <strong>${leave.label}</strong> - ${format(new Date(leave.startDate), 'MMM d, yyyy')} to ${format(new Date(leave.endDate), 'MMM d, yyyy')}
      </div>
    `).join('')}
    ${ptdyDays > 0 ? `
      <div class="timeline-item">
        <span class="timeline-type type-ptdy">PTDY</span>
        <strong>PTDY (${ptdyDays} days)</strong> - Ends ${format(new Date(formData.separationDate), 'MMM d, yyyy')}
      </div>
    ` : ''}
    ${optimalSplit.terminalLeaveDays > 0 ? `
      <div class="timeline-item">
        <span class="timeline-type type-terminal">Terminal Leave</span>
        <strong>Terminal Leave (${optimalSplit.terminalLeaveDays.toFixed(1)} days)</strong> - ${format(optimalSplit.terminalLeaveStartDate, 'MMM d, yyyy')} to ${format(new Date(formData.separationDate), 'MMM d, yyyy')}
      </div>
    ` : ''}
  </div>

  ${octoberWarnings.length > 0 ? `
    <div class="section">
      <div class="section-title">⚠ October 1st Warnings</div>
      ${octoberWarnings.map(warning => `
        <div class="warning-box">
          <strong>${format(warning.date, 'MMMM d, yyyy')}:</strong> You will have ${warning.balance} days of leave. 
          You need to use ${warning.excessDays} days before this date to avoid losing leave.
        </div>
      `).join('')}
    </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Key Dates</div>
    <table>
      <tbody>
        <tr>
          <td><strong>Today</strong></td>
          <td>${format(new Date(formData.todayDate), 'MMMM d, yyyy')}</td>
        </tr>
        ${optimalSplit.terminalLeaveStartDate ? `
          <tr>
            <td><strong>Terminal Leave Starts</strong></td>
            <td>${format(optimalSplit.terminalLeaveStartDate, 'MMMM d, yyyy')}</td>
          </tr>
        ` : ''}
        <tr>
          <td><strong>Separation/Retirement Date</strong></td>
          <td>${format(new Date(formData.separationDate), 'MMMM d, yyyy')}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p><strong>DISCLAIMER:</strong> This tool provides estimates only. Consult with your command's personnel office for official guidance.</p>
    <p>Generated by MilTransition Planner | Thank you for your service</p>
  </div>
</body>
</html>
  `;
};

export const exportToPrint = (htmlContent) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

export const exportToHTML = (htmlContent, filename = 'transition-plan.html') => {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToJSON = (formData, filename = 'transition-plan.json') => {
  const jsonData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    data: formData
  };
  
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importFromJSON = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const jsonData = JSON.parse(e.target.result);
      if (jsonData.data) {
        callback(jsonData.data);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      alert('Error loading plan file. Please ensure it is a valid transition plan file.');
    }
  };
  reader.readAsText(file);
};
