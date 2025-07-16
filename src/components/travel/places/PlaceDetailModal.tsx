import React from 'react';
import Modal from '../../common/Modal';
import { MapPin, Star, Clock, Phone, Globe, Edit3 } from 'lucide-react';

interface Place {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  description: string;
  address: string;
  phone?: string;
  website?: string;
  openingHours: string;
  priceRange: string;
  isFavorite: boolean;
}

interface PlaceDetailModalProps {
  place: Place;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ place, isOpen, onClose, onEdit }) => {
  if (!place) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={place.name} size="md">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded-full">
            {place.category || '未設定'}
          </span>
          <span className="flex items-center gap-1 text-yellow-500 text-sm">
            <Star className="h-4 w-4" />
            {place.rating}
          </span>
        </div>
        <p className="text-gray-700 text-sm">{place.description}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{place.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{place.openingHours}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{place.priceRange}</span>
          </div>
          {place.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{place.phone}</span>
            </div>
          )}
          {place.website && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-4 w-4" />
              <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{place.website}</a>
            </div>
          )}
        </div>
        <div className="flex justify-end pt-4">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="h-4 w-4" /> 編集
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PlaceDetailModal; 