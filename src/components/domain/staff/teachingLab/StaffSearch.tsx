import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface StaffSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function StaffSearch({ 
  value, 
  onChange, 
  placeholder = "Search staff...",
  className = ""
}: StaffSearchProps) {
  const [inputValue, setInputValue] = useState(value);
  
  // Update local state when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Debounce search to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [inputValue, onChange, value]);
  
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>
      <input
        type="text"
        className="w-full py-2 pl-10 pr-4 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {inputValue && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          onClick={() => {
            setInputValue('');
            onChange('');
          }}
        >
          <X size={16} className="text-gray-400 hover:text-gray-500" />
        </button>
      )}
    </div>
  );
} 