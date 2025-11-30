import React from 'react';
import { InputFieldProps } from '../types';

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  onFocus, 
  prefix, 
  suffix, 
  placeholder,
  active = false
}) => {
  return (
    <div className={`group transition-all duration-300 ${active ? 'transform translate-x-1' : ''}`}>
      <div className="flex justify-between items-center mb-2 px-1">
        <label className={`text-xs font-semibold tracking-wide uppercase transition-colors ${active ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
          {label}
        </label>
        {active && (
          <span className="text-[10px] text-blue-500 font-bold tracking-wider animate-pulse">ACTIVE</span>
        )}
      </div>
      
      <div className={`
        relative flex items-center w-full rounded-lg overflow-hidden transition-all duration-300
        bg-gray-950/50 border
        ${active 
          ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
          : 'border-white/5 hover:border-white/10 hover:bg-gray-950/80'
        }
      `}>
        {prefix && (
          <div className={`pl-4 pr-2 text-sm font-medium ${active ? 'text-blue-400' : 'text-gray-500'}`}>
            {prefix}
          </div>
        )}
        
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          placeholder={placeholder}
          className={`
            w-full bg-transparent py-4 text-lg font-mono placeholder-gray-700 focus:outline-none
            ${active ? 'text-white' : 'text-gray-300'}
            ${!prefix && 'pl-4'}
            ${!suffix && 'pr-4'}
          `}
          step="any"
        />

        {suffix && (
          <div className="pr-4 pl-2 text-xs font-bold text-gray-600 uppercase tracking-wider">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputField;