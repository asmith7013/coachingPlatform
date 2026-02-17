import React from "react";
import { statusColors, deliveryColors } from "./constants";

const Legend: React.FC = () => {
  return (
    <div className="mt-6 bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-3">Legend</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Status</h4>
          <div className="space-y-2">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center">
                <span className={`w-4 h-4 rounded-full ${color} mr-2`}></span>
                <span className="text-sm">{status}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Delivery Method</h4>
          <div className="space-y-2">
            {Object.entries(deliveryColors).map(([delivery, color]) => (
              <div key={delivery} className="flex items-center">
                <span className={`w-4 h-4 rounded-full ${color} mr-2`}></span>
                <span className="text-sm">{delivery}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Cycles</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-4 h-4 rounded-full bg-blue-100 mr-2"></span>
              <span className="text-sm">Winter Cycle</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 rounded-full bg-green-100 mr-2"></span>
              <span className="text-sm">Spring Cycle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legend;
