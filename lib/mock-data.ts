export interface Worker {
  id: string;
  name: string;
  skill: string;
  location: string;
  availability: "online" | "offline";
  rating: number;
  totalJobsCompleted: number;
  experience: number;
  serviceDescription: string;
}

export interface JobRequest {
  id: string;
  clientName: string;
  service: string;
  distance: number;
  timeReceived: string;
  status: "pending" | "accepted" | "completed";
}

export interface ActiveJob {
  id: string;
  clientName: string;
  serviceType: string;
  location: string;
  jobStatus: "in-progress" | "completed";
  acceptedAt: string;
}

export interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

// Mock Worker Profile
export const mockWorker: Worker = {
  id: "w-001",
  name: "Juan Dela Cruz",
  skill: "Electrician",
  location: "Quezon City",
  availability: "online",
  rating: 4.8,
  totalJobsCompleted: 25,
  experience: 8,
  serviceDescription:
    "Professional electrical installations and repairs for residential and commercial properties. Licensed and insured.",
};

// Mock Job Requests
export const mockJobRequests: JobRequest[] = [
  {
    id: "job-001",
    clientName: "Maria Santos",
    service: "Electrical Repair",
    distance: 1.2,
    timeReceived: "Just now",
    status: "pending",
  },
  {
    id: "job-002",
    clientName: "Pedro Garcia",
    service: "Ceiling Fan Installation",
    distance: 2.5,
    timeReceived: "5 minutes ago",
    status: "pending",
  },
  {
    id: "job-003",
    clientName: "Ana Reyes",
    service: "Electrical Troubleshooting",
    distance: 0.8,
    timeReceived: "15 minutes ago",
    status: "pending",
  },
];

// Mock Active Job
export const mockActiveJob: ActiveJob = {
  id: "active-001",
  clientName: "Rosa Maldonado",
  serviceType: "Emergency Electrical Repair",
  location: "Makati City",
  jobStatus: "in-progress",
  acceptedAt: "2 hours ago",
};

// Mock Worker Stats
export const mockWorkerStats = {
  rating: 4.8,
  totalJobsCompleted: 25,
  skillCategory: "Electrician",
  serviceLocation: "Quezon City",
};

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: "review-001",
    clientName: "Maria Santos",
    rating: 5,
    comment: "Very fast repair! Professional service and great communication.",
    date: "2 days ago",
  },
  {
    id: "review-002",
    clientName: "Pedro Garcia",
    rating: 4,
    comment: "Professional service and completed on time.",
    date: "1 week ago",
  },
  {
    id: "review-003",
    clientName: "Ana Reyes",
    rating: 5,
    comment: "Excellent work! Very knowledgeable and friendly.",
    date: "2 weeks ago",
  },
];

// Client Types
export interface ClientProfile {
  id: string;
  name: string;
  location: string;
  joinDate: string;
}

export interface AvailableWorker {
  id: string;
  name: string;
  skill: string;
  rating: number;
  experience: number;
  distance: number;
  availability: "online" | "offline";
  description: string;
  completedJobs: number;
  location?: string;
  postedAt?: string; // e.g. "2 hours ago", "Yesterday"
}

export interface ServiceRequest {
  id: string;
  workerId: string;
  workerName: string;
  service: string;
  status: "pending" | "accepted" | "completed";
  requestedAt: string;
  acceptedAt?: string;
}

export interface CompletedService {
  id: string;
  workerName: string;
  skill: string;
  serviceDate: string;
  rating?: number;
  comment?: string;
}

// Mock Client Profile
export const mockClientProfile: ClientProfile = {
  id: "c-001",
  name: "Maria Santos",
  location: "Quezon City",
  joinDate: "3 months ago",
};

// Mock Available Workers
export const mockAvailableWorkers: AvailableWorker[] = [
  {
    id: "w-001",
    name: "Juan Dela Cruz",
    skill: "Electrician",
    rating: 4.8,
    experience: 8,
    distance: 1.2,
    availability: "online",
    description:
      "Professional electrical installations and repairs for residential and commercial properties. Licensed and insured.",
    completedJobs: 25,
    location: "Quezon City",
    postedAt: "2 hours ago",
  },
  {
    id: "w-002",
    name: "Rosa Villanueva",
    skill: "Plumber",
    rating: 4.9,
    experience: 12,
    distance: 0.8,
    availability: "online",
    description:
      "Expert plumbing services including pipe installation, repairs, and maintenance. Available 24/7.",
    completedJobs: 45,
    location: "Quezon City",
    postedAt: "Yesterday",
  },
  {
    id: "w-003",
    name: "Miguel Santos",
    skill: "Carpenter",
    rating: 4.7,
    experience: 10,
    distance: 2.1,
    availability: "online",
    description:
      "Skilled carpentry work for furniture, doors, and structural woodwork. Custom designs available.",
    completedJobs: 32,
    location: "Makati City",
    postedAt: "5 hours ago",
  },
  {
    id: "w-004",
    name: "Carlos Reyes",
    skill: "Mechanic",
    rating: 4.6,
    experience: 6,
    distance: 3.5,
    availability: "offline",
    description:
      "Auto mechanic specializing in engine repairs and maintenance. All makes and models.",
    completedJobs: 18,
    location: "Mandaluyong",
    postedAt: "1 day ago",
  },
  {
    id: "w-005",
    name: "Fernando Lopez",
    skill: "Appliance Repair",
    rating: 4.9,
    experience: 15,
    distance: 1.8,
    availability: "online",
    description:
      "Repair for all major home appliances. Fast diagnostics and affordable service.",
    completedJobs: 67,
    location: "Quezon City",
    postedAt: "Just now",
  },
];

// Mock Service Requests
export const mockServiceRequests: ServiceRequest[] = [
  {
    id: "req-001",
    workerId: "w-001",
    workerName: "Juan Dela Cruz",
    service: "Electrical Repair",
    status: "pending",
    requestedAt: "15 minutes ago",
  },
];

// Mock Completed Services
export const mockCompletedServices: CompletedService[] = [
  {
    id: "comp-001",
    workerName: "Juan Dela Cruz",
    skill: "Electrician",
    serviceDate: "2 weeks ago",
    rating: 5,
    comment: "Fast and professional service!",
  },
  {
    id: "comp-002",
    workerName: "Rosa Villanueva",
    skill: "Plumber",
    serviceDate: "1 month ago",
    rating: 4,
    comment: "Good work, very reliable.",
  },
];
