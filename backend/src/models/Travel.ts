import mongoose, { Document, Schema } from 'mongoose';

export interface ITravel extends Document {
  title: string;
  destination: string;
  duration: string;
  dates: string;
  description: string;
  image: string;
  status: 'planning' | 'confirmed' | 'completed';
  memberCount: number;
  budget: number;
  interests: string[];
  travelStyle: string;
  schedule: Array<{
    date: string;
    day: string;
    items: Array<{
      time: string;
      title: string;
      location: string;
      description: string;
      category: string;
    }>;
  }>;
  places: Array<{
    name: string;
    category: string;
    rating: number;
    description: string;
  }>;
  budgetBreakdown: {
    transportation: number;
    accommodation: number;
    food: number;
    activities: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TravelSchema = new Schema<ITravel>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true
  },
  dates: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'completed'],
    default: 'planning'
  },
  memberCount: {
    type: Number,
    required: true,
    min: 1
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  interests: [{
    type: String
  }],
  travelStyle: {
    type: String,
    default: 'balanced'
  },
  schedule: [{
    date: String,
    day: String,
    items: [{
      time: String,
      title: String,
      location: String,
      description: String,
      category: String
    }]
  }],
  places: [{
    name: String,
    category: String,
    rating: Number,
    description: String
  }],
  budgetBreakdown: {
    transportation: { type: Number, default: 0 },
    accommodation: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    activities: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

export default mongoose.model<ITravel>('Travel', TravelSchema); 