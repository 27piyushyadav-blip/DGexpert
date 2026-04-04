const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/experts";

// Types for API responses
type ExpertProfileResponse = {
  id: string;
  name: string;
  email: string;
  username: string;
  image: string | null;
  bio: string | null;
  experience: number;
  specialization: string | null;
  consultationFee: number | null;
  languages: string[];
  education: Array<{
    degree: string;
    fieldOfStudy: string;
    institution: string;
    year: number;
  }> | null;
  latestEducation: string | null;
  profileImage: string | null;
  introVideo: string | null;
  verificationStatus: string;
  rejectionReason: string | null;
  hasPendingUpdates: boolean;
  isVerified: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  // Additional fields
  timezone: string | null;
  gender: string | null;
  location: string | null;
  socialLinks: Record<string, string>;
  tags: string[];
  workHistory: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
  }>;
  services: Array<{
    name: string;
    duration: number;
    videoPrice: number;
    clinicPrice: number;
    currency: string;
    description: string;
  }>;
  documents: Array<{
    title: string;
    category: string;
    url: string;
    fileType?: string;
    fileSize?: string;
  }>;
  availability: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
  leaves: Array<{
    date: string | Date;
    note?: string;
    isRecurring?: boolean;
  }>;
  fieldStatuses?: Record<string, { value: any; status: string }>;
};

type DashboardResponse = {
  todayBookings: number;
  upcomingBookings: number;
  completedSessions: number;
  earningsThisMonth: number;
  status: string;
  onboarding: boolean;
  rejectionReason: string | null;
  profile: {
    hasPendingUpdates: boolean;
  };
};

type UpdateProfileResponse = {
  message: string;
  status: string;
  profile?: ExpertProfileResponse;
};

type FileUploadResponse = {
  message: string;
  fileUrl: string;
  status: string;
};

// API Error handler
export class ExpertError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ExpertError(data.message || 'Request failed', response.status);
  }
  
  return data;
}

// Helper function to get auth headers
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

// 1. Get Expert Profile
export async function getExpertProfileApi(): Promise<ExpertProfileResponse> {
  const response = await fetch(`${BASE_URL}/profile`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse<ExpertProfileResponse>(response);
}

// 2. Update Expert Profile
export async function updateExpertProfileApi(data: {
  bio?: string;
  experience?: number;
  specialization?: string;
  consultationFee?: number;
  languages?: string[];
  education?: Array<{
    degree: string;
    fieldOfStudy: string;
    institution: string;
    year: number;
  }>;
  latestEducation?: string;
}): Promise<UpdateProfileResponse> {
  const response = await fetch(`${BASE_URL}/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<UpdateProfileResponse>(response);
}

// 3. Upload Profile Image
export async function uploadProfileImageApi(file: File): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/profile/image`, {
    method: "POST",
    headers,
    body: formData,
  });

  return handleResponse<FileUploadResponse>(response);
}

// 4. Upload Intro Video
export async function uploadIntroVideoApi(file: File): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/profile/intro-video`, {
    method: "POST",
    headers,
    body: formData,
  });

  return handleResponse<FileUploadResponse>(response);
}

// 5. Upload Document
export async function uploadDocumentApi(file: File, title: string, category: string): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("category", category);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/profile/documents`, {
    method: "POST",
    headers,
    body: formData,
  });

  return handleResponse<any>(response);
}

// 6. Get Dashboard Data
export async function getExpertDashboardApi(): Promise<DashboardResponse> {
  const response = await fetch(`${BASE_URL}/dashboard`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse<DashboardResponse>(response);
}
