// frontend/src/pages/doctors/DoctorFilter.jsx
import { FiSearch, FiX } from "react-icons/fi";

const specializations = [
  "All", "General Physician", "Cardiologist", "Dermatologist",
  "Neurologist", "Orthopedic", "Pediatrician", "Psychiatrist",
  "Gynecologist", "ENT Specialist", "Dentist", "Ophthalmologist",
];

const DoctorFilter = ({ selected, onSelect, searchTerm, onSearch }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search doctor by name..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => onSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX size={14} />
          </button>
        )}
      </div>

      {/* Specialization Pills */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Filter by Specialization
        </p>
        <div className="flex flex-wrap gap-2">
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => onSelect(spec)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selected === spec
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorFilter;
