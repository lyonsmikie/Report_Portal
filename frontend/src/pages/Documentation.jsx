import React from 'react';
import HeaderBar from '../components/HeaderBar';

function Documentation() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <HeaderBar backLinks={[{ label: "← Back", path: "back" }]} showDocumentation={false} />
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold mb-6">Documentation</h1>
        
        <div className="prose prose-sm max-w-none space-y-8">
          {/* MACD Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">MACD</h2>
            <div className="bg-gray-50 p-4 rounded border-l-4 border-blue-500">
              <p className="text-gray-600">
                Documentation for MACD reports and analysis will be added here.
              </p>
            </div>
          </section>

          {/* RSI Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">RSI</h2>
            <div className="bg-gray-50 p-4 rounded border-l-4 border-green-500">
              <p className="text-gray-600">
                Documentation for RSI reports and analysis will be added here.
              </p>
            </div>
          </section>

          {/* STOCHASTIC Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">STOCHASTIC</h2>
            <div className="bg-gray-50 p-4 rounded border-l-4 border-purple-500">
              <p className="text-gray-600">
                Documentation for STOCHASTIC reports and analysis will be added here.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Documentation;
