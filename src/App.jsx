import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import Step1Profile from './components/Step1Profile';
import Step2Timeline from './components/Step2Timeline';
import Step3Summary from './components/Step3Summary';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    currentLeave: 30,
    accrualRate: 2.5,
    todayDate: new Date().toISOString().split('T')[0],
    separationDate: '',
    separationType: 'separating',
    dutyStation: 'stateside',
    monthlyBasePay: 5000,
    maxSellBack: 60,
    previouslySoldDays: 0,
    manualPTDY: 0,
    plannedLeave: [],
    skillbridge: [],
    ptdyBlocks: []
  });

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setFormData({
      currentLeave: 30,
      accrualRate: 2.5,
      todayDate: new Date().toISOString().split('T')[0],
      separationDate: '',
      separationType: 'separating',
      dutyStation: 'stateside',
      monthlyBasePay: 5000,
      maxSellBack: 60,
      previouslySoldDays: 0,
      manualPTDY: 0,
      plannedLeave: [],
      skillbridge: [],
      ptdyBlocks: []
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-military-navy via-gray-900 to-military-navy-light py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-16 h-16 text-military-amber mr-4" />
            <h1 className="text-5xl md:text-6xl font-display text-military-amber uppercase tracking-wider">
              MilTransition Planner
            </h1>
          </div>
          <p className="text-xl text-gray-300 font-body">
            Leave and Transition Planning for Separating and Retiring Service Members
          </p>
        </header>

        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                      currentStep === step
                        ? 'bg-military-amber text-military-navy scale-110 shadow-lg'
                        : currentStep > step
                        ? 'bg-green-600 text-white'
                        : 'bg-military-olive text-gray-400'
                    }`}
                  >
                    {currentStep > step ? '✓' : step}
                  </div>
                  <div
                    className={`mt-2 text-sm font-semibold uppercase tracking-wide ${
                      currentStep === step ? 'text-military-amber' : 'text-gray-500'
                    }`}
                  >
                    {step === 1 ? 'Profile' : step === 2 ? 'Plan' : 'Summary'}
                  </div>
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 md:w-24 h-1 mb-6 transition-all duration-300 ${
                      currentStep > step ? 'bg-green-600' : 'bg-military-olive'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <main>
          {currentStep === 1 && (
            <Step1Profile
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <Step2Timeline
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <Step3Summary
              formData={formData}
              onBack={handleBack}
              onRestart={handleRestart}
            />
          )}
        </main>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p className="mb-2">
            This tool provides estimates only. Consult with your command's personnel office for official guidance.
          </p>
          <p>
            Built for transitioning service members | Thank you for your service
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
