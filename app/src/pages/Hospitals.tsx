import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Filter, X, Building2, Loader2, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';
import type { Hospital } from '../types';
import HospitalCard from '../components/HospitalCard';
import { toast } from 'sonner';

const kenyanCounties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu',
  'Kiambu', 'Machakos', 'Kajiado', 'Nyeri', 'Meru',
  'Kilifi', 'Kwale', 'Kakamega', 'Bungoma', 'Siaya',
];

const Hospitals = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCounty, setSelectedCounty] = useState(searchParams.get('county') || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchHospitals(); }, []);

  useEffect(() => { filterHospitals(); }, [hospitals, searchQuery, selectedCounty]);

  const fetchHospitals = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (searchParams.get('search')) params.search = searchParams.get('search');
      if (searchParams.get('county')) params.county = searchParams.get('county');
      const response = await api.get('/hospitals', { params });
      setHospitals(response.data.data);
    } catch {
      toast.error('Failed to load hospitals');
    } finally {
      setIsLoading(false);
    }
  };

  const filterHospitals = () => {
    let filtered = [...hospitals];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.location.address.toLowerCase().includes(q) ||
        h.location.city.toLowerCase().includes(q) ||
        h.location.county.toLowerCase().includes(q)
      );
    }
    if (selectedCounty) {
      filtered = filtered.filter(h => h.location.county.toLowerCase() === selectedCounty.toLowerCase());
    }
    setFilteredHospitals(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCounty) params.county = selectedCounty;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCounty('');
    setSearchParams({});
  };

  return (
    <div className="space-y-8">
      {/* Header with background */}
      <div className="relative rounded-2xl overflow-hidden">
        <img src="/doctor-kenya.jpg" alt="Kenyan doctor" className="w-full h-48 object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-700/70" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h1 className="text-3xl md:text-4xl font-black text-white">Find Hospitals</h1>
          <p className="text-blue-200 mt-1">Discover and book appointments at hospitals across Kenya</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search hospitals by name, city or county..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-12 rounded-xl px-4 ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button type="submit" className="h-12 rounded-xl px-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold">
            Search
          </Button>
        </form>

        {showFilters && (
          <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filter by County
              </h3>
              {(selectedCounty || searchQuery) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600">
                  <X className="w-4 h-4 mr-1" /> Clear All
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {kenyanCounties.map((county) => (
                <Badge
                  key={county}
                  variant={selectedCounty === county ? 'default' : 'outline'}
                  className={`cursor-pointer text-sm py-1.5 px-3 transition-all ${
                    selectedCounty === county
                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                      : 'hover:bg-blue-50 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedCounty(selectedCounty === county ? '' : county)}
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  {county}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(selectedCounty || searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-500">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1 rounded-full">
                "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer ml-1" onClick={() => setSearchQuery('')} />
              </Badge>
            )}
            {selectedCounty && (
              <Badge variant="secondary" className="flex items-center gap-1 rounded-full">
                <MapPin className="w-3 h-3" /> {selectedCounty}
                <X className="w-3 h-3 cursor-pointer ml-1" onClick={() => setSelectedCounty('')} />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-slate-500">Loading hospitals...</p>
        </div>
      ) : filteredHospitals.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 font-medium">
            Showing <span className="text-blue-600 font-bold">{filteredHospitals.length}</span> hospital{filteredHospitals.length !== 1 ? 's' : ''}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => (
              <HospitalCard key={hospital._id} hospital={hospital} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">No hospitals found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search or removing filters</p>
          <Button variant="outline" className="mt-6 rounded-xl" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Hospitals;
