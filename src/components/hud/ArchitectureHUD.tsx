'use client';

import React, { useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { Terminal, Database, Cpu, Radio, ChevronUp, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ArchitectureHUDProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ArchitectureHUD: React.FC<ArchitectureHUDProps> = ({ isOpen, onToggle }) => {
  const { kafkaLogs, isBackendConnected } = useTripStore();
  const [activeTab, setActiveTab] = useState<'kafka' | 'services' | 'redis'>('kafka');

  return (
    <div className="fixed bottom-4 right-6 z-30 flex flex-col items-end">
      {/* HUD Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-[520px] max-w-[calc(100vw-3rem)] h-[340px] mb-3 glass-panel-elevated rounded-3xl p-5 flex flex-col shadow-glass border border-slate-700/80"
          >
            {/* Header Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-neon-emerald" />
                <span className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                  System Architecture Inspector
                </span>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-obsidian-900/90 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
                <button
                  onClick={() => setActiveTab('kafka')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeTab === 'kafka' ? 'bg-neon-emerald/20 text-neon-emerald font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Kafka Events ({kafkaLogs.length})
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeTab === 'services' ? 'bg-neon-cyan/20 text-neon-cyan font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Go Microservices
                </button>
                <button
                  onClick={() => setActiveTab('redis')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeTab === 'redis' ? 'bg-rose-500/20 text-rose-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Redis Geo
                </button>
              </div>
            </div>

            {/* Tab 1: Kafka Events Stream */}
            {activeTab === 'kafka' && (
              <div className="flex-1 overflow-y-auto mt-3 pr-1 flex flex-col gap-2 font-mono text-xs">
                {kafkaLogs.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <Radio className="w-6 h-6 animate-pulse text-slate-600" />
                    <p className="text-xs">No Kafka events yet. Confirm a ride order to watch live event orchestration!</p>
                  </div>
                ) : (
                  kafkaLogs.map((log) => {
                    const topicColor =
                      log.topic === 'trip.requested'
                        ? 'text-neon-cyan border-neon-cyan/40 bg-neon-cyan/10'
                        : log.topic === 'trip.matched'
                        ? 'text-neon-emerald border-neon-emerald/40 bg-neon-emerald/10'
                        : log.topic === 'trip.completed'
                        ? 'text-neon-purple border-neon-purple/40 bg-neon-purple/10'
                        : 'text-amber-400 border-amber-400/40 bg-amber-400/10';

                    return (
                      <div key={log.id} className="p-2.5 rounded-xl bg-obsidian-950/80 border border-slate-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${topicColor}`}>
                            {log.topic}
                          </span>
                          <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          <span className="text-slate-500">Service:</span> {log.sourceService}
                        </div>
                        <pre className="mt-1 text-[10px] text-slate-400 bg-obsidian-900/90 p-1.5 rounded overflow-x-auto border border-slate-800/80">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 2: Go Microservices Topology */}
            {activeTab === 'services' && (
              <div className="flex-1 overflow-y-auto mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  { name: 'User Service', port: '50051', desc: 'gRPC • JWT • Postgres', status: 'Healthy' },
                  { name: 'Driver Service', port: '50052', desc: 'gRPC • Telemetry • Postgres', status: 'Healthy' },
                  { name: 'Trip Service', port: '50053', desc: 'gRPC • State Machine • Kafka', status: 'Healthy' },
                  { name: 'Matching Service', port: '50054', desc: 'Redis GEOSEARCH • Kafka', status: 'Healthy' },
                  { name: 'Payment Service', port: '50055', desc: 'gRPC • Billing • Kafka', status: 'Healthy' },
                  { name: 'API Gateway', port: '8080', desc: 'HTTP REST ➔ gRPC Proxy', status: 'Healthy' },
                ].map((svc) => (
                  <div key={svc.name} className="p-2.5 rounded-xl bg-obsidian-950/80 border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{svc.name}</span>
                      <span className="text-[10px] text-neon-emerald flex items-center gap-1 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald animate-pulse" />
                        {svc.port}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">{svc.desc}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Redis Geospatial Stats */}
            {activeTab === 'redis' && (
              <div className="flex-1 overflow-y-auto mt-3 flex flex-col gap-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-obsidian-950/80 border border-slate-800 flex flex-col gap-1.5">
                  <span className="text-slate-400">Key: <span className="text-neon-emerald">drivers:locations</span></span>
                  <span className="text-slate-400">Index Type: <span className="text-neon-cyan">Redis Sorted Set (52-bit Geohash)</span></span>
                  <span className="text-slate-400">Active Drivers Indexed: <span className="text-white font-bold">4 Drivers</span></span>
                </div>
                <div className="p-3 rounded-xl bg-obsidian-950/80 border border-slate-800 flex flex-col gap-1">
                  <span className="text-white font-semibold">Discovery Query Engine</span>
                  <p className="text-[11px] text-slate-400">
                    Executes <code className="text-neon-emerald">GEOSEARCH drivers:locations FROMCOORD ... BYRADIUS 5.0 km ASC</code> with sub-8ms latency.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        onClick={onToggle}
        className="glass-panel-elevated px-4 py-2 rounded-2xl flex items-center gap-2.5 text-xs font-mono font-semibold text-slate-200 hover:text-neon-emerald hover:border-neon-emerald/50 transition-all shadow-glass"
      >
        <span className="w-2 h-2 rounded-full bg-neon-emerald animate-ping" />
        <span>Architecture & Kafka HUD</span>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>
    </div>
  );
};
