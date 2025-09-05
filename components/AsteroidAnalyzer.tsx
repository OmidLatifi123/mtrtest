// components/AsteroidAnalyzer.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Zap, Info, AlertTriangle, Target } from 'lucide-react';
import * as THREE from 'three';

interface AsteroidAnalyzerProps {
  isActive: boolean;
  asteroidPosition: THREE.Vector3;
  onComplete: () => void;
}

const AsteroidAnalyzer: React.FC<AsteroidAnalyzerProps> = ({
  isActive,
  asteroidPosition,
  onComplete,
}) => {
  const [showHUD, setShowHUD] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  // Effect to handle activation
  useEffect(() => {
    if (isActive && !isScanning && !showHUD) {
      startScan();
    }
  }, [isActive]);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Animate scan progress
    const scanDuration = 3000; // 3 seconds
    const startTime = Date.now();
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / scanDuration, 1);
      setScanProgress(progress * 100);
      
      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        setIsScanning(false);
        setShowHUD(true);
      }
    };
    
    updateProgress();
  };

  const handleClose = () => {
    setShowHUD(false);
    setScanProgress(0);
    setIsScanning(false);
    onComplete();
  };

  if (!isActive) return null;

  return (
    <>
      {/* Scanning Progress Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900/90 backdrop-blur-md rounded-xl border border-blue-500/50 p-8 text-center">
            <div className="text-2xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-4">Scanning Asteroid</h3>
            <div className="w-64 bg-gray-700 rounded-full h-3 mb-4">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-100"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-300 text-sm">
              Analyzing composition, trajectory, and threat level...
            </p>
          </div>
        </div>
      )}

      {/* Analysis HUD */}
      {showHUD && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl border border-blue-500/50 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Target size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Impactor-2025</h2>
                    <p className="text-blue-100">Near-Earth Object Analysis</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 text-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Threat Assessment */}
                <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={20} className="text-red-400" />
                    <h3 className="text-lg font-bold text-red-400">Threat Level: CRITICAL</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Impact Probability:</span>
                      <span className="text-red-400 font-bold">99.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time to Impact:</span>
                      <span className="text-red-400 font-bold">47 days, 14 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Energy Release:</span>
                      <span className="text-red-400 font-bold">~15 Megatons TNT</span>
                    </div>
                  </div>
                </div>

                {/* Physical Characteristics */}
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Info size={20} className="text-blue-400" />
                    <h3 className="text-lg font-bold text-blue-400">Physical Properties</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Diameter:</span>
                      <span className="text-blue-400 font-bold">340 meters</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mass:</span>
                      <span className="text-blue-400 font-bold">~4.2 × 10⁷ tonnes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Composition:</span>
                      <span className="text-blue-400 font-bold">Stony (S-type)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rotation Period:</span>
                      <span className="text-blue-400 font-bold">2.3 hours</span>
                    </div>
                  </div>
                </div>

                {/* Orbital Parameters */}
                <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={20} className="text-green-400" />
                    <h3 className="text-lg font-bold text-green-400">Trajectory Data</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Velocity:</span>
                      <span className="text-green-400 font-bold">17.8 km/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approach Angle:</span>
                      <span className="text-green-400 font-bold">23.4°</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance:</span>
                      <span className="text-green-400 font-bold">0.31 AU</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Eccentricity:</span>
                      <span className="text-green-400 font-bold">0.847</span>
                    </div>
                  </div>
                </div>

                {/* Mission Recommendations */}
                <div className="bg-purple-900/30 border border-purple-500/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={20} className="text-purple-400" />
                    <h3 className="text-lg font-bold text-purple-400">Mitigation Options</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="bg-purple-800/30 p-2 rounded">
                      <strong className="text-purple-300">Kinetic Impactor:</strong> 
                      <span className="text-gray-300"> 73% success probability</span>
                    </div>
                    <div className="bg-purple-800/30 p-2 rounded">
                      <strong className="text-purple-300">Nuclear Option:</strong> 
                      <span className="text-gray-300"> 89% success probability</span>
                    </div>
                    <div className="bg-purple-800/30 p-2 rounded">
                      <strong className="text-purple-300">Gravity Tractor:</strong> 
                      <span className="text-gray-300"> Insufficient time</span>
                    </div>
                    <div className="bg-purple-800/30 p-2 rounded">
                      <strong className="text-purple-300">Laser Ablation:</strong> 
                      <span className="text-gray-300"> 45% success probability</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="mt-6 bg-gray-800/50 rounded-xl p-4">
                <h3 className="text-lg font-bold mb-3">Detailed Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-yellow-400 mb-2">Impact Scenario</h4>
                    <p className="text-gray-300 leading-relaxed">
                      Projected impact site: Pacific Ocean, 800km west of Chile. 
                      Tsunami waves up to 15m expected along Pacific coastlines. 
                      Atmospheric entry will produce airburst effects visible from 2000km.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-400 mb-2">Deflection Requirements</h4>
                    <p className="text-gray-300 leading-relaxed">
                      Minimum ΔV required: 3.2 mm/s. Optimal deflection window: 
                      Next 72 hours for maximum effectiveness. Late-phase missions 
                      require exponentially more energy.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={handleClose}
                  className="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-lg transition-colors"
                >
                  Close Analysis
                </button>
                <button
                  onClick={handleClose}
                  className="bg-red-600 hover:bg-red-500 px-6 py-2 rounded-lg transition-colors"
                >
                  Recommend Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AsteroidAnalyzer;