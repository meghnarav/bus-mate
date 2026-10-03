import React, { useState } from 'react';
import DriverScanner from './pages/DriverScanner';
import SeatPickerGrid from './components/SeatPickerGrid';
import DynamicQRCode from './components/DynamicQRCode';

function App() {
  const [currentView, setCurrentView] = useState<'passenger' | 'driver'>('passenger');

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-indigo-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Campus Shuttle</h1>
        <div className="space-x-4">
          <button 
            onClick={() => setCurrentView('passenger')}
            className={`px-3 py-1 rounded ${currentView === 'passenger' ? 'bg-indigo-800' : 'bg-indigo-500 hover:bg-indigo-400'}`}
          >
            Passenger View
          </button>
          <button 
            onClick={() => setCurrentView('driver')}
            className={`px-3 py-1 rounded ${currentView === 'driver' ? 'bg-indigo-800' : 'bg-indigo-500 hover:bg-indigo-400'}`}
          >
            Driver View
          </button>
        </div>
      </nav>

      <main className="p-6">
        {currentView === 'driver' ? (
          <DriverScanner />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            <div className="flex-1 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Select Your Seat</h2>
              <SeatPickerGrid 
                rows={10} 
                columns={4} 
                groupSize={2} 
                reservedSeats={[3, 4, 12, 15]} 
                onSeatSelect={(seats) => console.log('Selected:', seats)} 
              />
            </div>
            <div className="flex-1 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Ticket</h2>
              <DynamicQRCode ticketId="TKT-12345" secretSeed="sample-secret-seed-for-testing" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
