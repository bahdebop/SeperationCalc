# MilTransition Planner

A comprehensive leave and transition planning tool for military members separating or retiring from service.

## Features

- **Member Profile Setup**: Input current leave balance, accrual rates, separation dates, and financial information
- **Interactive Timeline Planning**: Visual timeline showing Skillbridge programs, planned leave blocks, PTDY, and terminal leave
- **Smart Calculations**: Automatic calculation of leave accrual, terminal leave, and optimal sell-back recommendations
- **October 1st Warnings**: Alerts when leave balance will exceed the 60-day cap
- **Leave Balance Tracking**: Real-time validation to prevent over-planning
- **Sell-Back Optimization**: Calculates maximum sell-back value based on base pay

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Building for Production

```bash
npm run build
```

## Technology Stack

- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **date-fns** - Date calculations
- **Lucide React** - Icons
- **Recharts** - Data visualization (available for future enhancements)

## Usage Guide

### Step 1: Member Profile
Enter your personal information including:
- Current leave balance
- Leave accrual rate (default 2.5 days/month)
- Today's date and separation/retirement date
- Separation type (Separating or Retiring)
- Duty station (Stateside or Overseas)
- Monthly base pay
- Max leave sell-back allowed
- Previously sold leave days

### Step 2: Timeline Planning
- Add Skillbridge programs with start/end dates
- Plan leave blocks throughout your remaining service
- View visual timeline of all events
- Monitor leave balance in real-time
- Receive warnings for October 1st leave caps
- Validate that leave balance stays positive

### Step 3: Summary Dashboard
- Review total days until separation
- See projected leave balance
- Get terminal leave recommendations
- View optimal sell-back calculations
- Check for any leave forfeitures
- Review all key dates and milestones

## Important Notes

- PTDY (Permissive Temporary Duty) does not consume leave balance
- Skillbridge is on-duty time and does not consume leave
- Maximum 60 days of leave can be sold back in a career
- Leave balance is capped at 60 days on October 1st each year
- This tool provides estimates only - consult your command's personnel office for official guidance

## Military-Inspired Design

The application features a military aesthetic with:
- Dark navy and olive color palette
- Amber/gold accents for emphasis
- Bold, condensed display typography
- Clean geometric layouts
- Responsive design for mobile and desktop

## License

This project is provided as-is for use by transitioning service members.

---

**Thank you for your service!**
