// src/pages/security-services/components/ServiceCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

const ServiceCard = ({ service, onSelect }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    teal: 'bg-teal-50 text-teal-600',
    sky: 'bg-sky-50 text-sky-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        onClick={onSelect}
        className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/20"
      >
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl ${colorClasses[service.color]}`}>
              {service.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {service.label}
              </h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {service.description}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end text-sm text-primary">
            <span className="font-medium">Request Service</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
