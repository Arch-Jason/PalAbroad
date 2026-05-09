'use client';
import { useState, useEffect, useRef } from 'react';

export default function SchoolDropdown({ type, value, onChange, placeholder }) {
  const [options, setOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch(`/api/schools?type=${type}`);
        const data = await res.json();
        setOptions(data);
      } catch (err) {
        console.error('Failed to fetch school options', err);
      }
    };
    fetchOptions();
  }, [type]);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        // If the search term doesn't match an option, reset it to the current value
        const match = options.find(opt => opt.name === value || opt.subName === value);
        if (!match) {
           setSearchTerm(value || '');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [options, value]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    
    if (term.trim() === '') {
      setFilteredOptions([]);
      return;
    }

    const filtered = options.filter(opt => 
      (opt.name && opt.name.toLowerCase().includes(term.toLowerCase())) || 
      (opt.subName && opt.subName.toLowerCase().includes(term.toLowerCase()))
    ).slice(0, 10); // Limit results for performance
    setFilteredOptions(filtered);
  };

  const handleSelect = (option) => {
    const displayValue = option.name;
    setSearchTerm(displayValue);
    onChange(displayValue);
    setIsOpen(false);
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearch}
        onFocus={() => {
            if (searchTerm) {
                const filtered = options.filter(opt => 
                    (opt.name && opt.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
                    (opt.subName && opt.subName.toLowerCase().includes(searchTerm.toLowerCase()))
                ).slice(0, 10);
                setFilteredOptions(filtered);
            }
            setIsOpen(true);
        }}
        required
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
          {filteredOptions.map((opt, index) => (
            <li
              key={index}
              className="list-group-item list-group-item-action cursor-pointer"
              onClick={() => handleSelect(opt)}
              style={{ cursor: 'pointer' }}
            >
              <div>{opt.name}</div>
              {opt.subName && <small className="text-muted">{opt.subName}</small>}
            </li>
          ))}
        </ul>
      )}
      {isOpen && searchTerm && filteredOptions.length === 0 && (
         <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 1000 }}>
            <li className="list-group-item text-muted small">未找到匹配项，请从列表选择</li>
         </ul>
      )}
    </div>
  );
}
