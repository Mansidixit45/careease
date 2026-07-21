// frontend/src/pages/doctors/DoctorList.jsx
import { useState, useEffect } from "react";
import axios from "../../api/axios";
import DoctorCard from "./DoctorCard";
import DoctorFilter from "./DoctorFilter";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/doctors");
        setDoctors(res.data.doctors || []);
        setFiltered(res.data.doctors || []);
      } catch {
        setError("Doctors load nahi hue. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    let result = [...doctors];
    if (selectedSpec !== "All") {
      result = result.filter(
        (doc) => doc.specialization?.toLowerCase() === selectedSpec.toLowerCase()
      );
    }
    if (searchTerm.trim() !== "") {
      result = result.filter((doc) =>
        doc.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFiltered(result);
  }, [selectedSpec, searchTerm, doctors]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-10">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold">Find a Doctor</h1>
            <p className="text-blue-200 mt-1 text-sm">Loading specialists...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">Loading doctors...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-6 py-10 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <p className="text-blue-200 text-sm font-medium mb-1">🏥 CareEase</p>
          <h1 className="text-3xl font-bold tracking-tight">Find a Doctor</h1>
          <p className="text-blue-200 mt-1 text-sm">
            {filtered.length} specialist{filtered.length !== 1 ? "s" : ""} available near you
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filter */}
        <DoctorFilter
          selected={selectedSpec}
          onSelect={setSelectedSpec}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 font-medium text-lg">No doctors found</p>
            <p className="text-gray-400 text-sm mt-1">Try changing your filter or search term</p>
            <button
              onClick={() => { setSelectedSpec("All"); }}
              className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorList;
