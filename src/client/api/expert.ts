import { apiClient, ApiError as ExpertError } from "./api-client";
export { ExpertError };

// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/experts";
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000") + "/experts";

// Types for API responses
export type ExpertProfileResponse = {
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
    enabled?: boolean;
  }>;
  leaves: Array<{
    date: string | Date;
    note?: string;
    isRecurring?: boolean;
  }>;
  fieldStatuses?: Record<string, { value: any; status: string }>;
};

export type DashboardResponse = {
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

export type UpdateProfileResponse = {
  message: string;
  status: string;
  profile?: ExpertProfileResponse;
};

export type FileUploadResponse = {
  message: string;
  fileUrl: string;
  status: string;
};

// 1. Get Expert Profile
export async function getExpertProfileApi(): Promise<ExpertProfileResponse> {
  return apiClient<ExpertProfileResponse>(`${BASE_URL}/profile`, {
    method: "GET",
  });
}

// 2. Update Expert Profile
export async function updateExpertProfileApi(data: any): Promise<UpdateProfileResponse> {
  return apiClient<UpdateProfileResponse>(`${BASE_URL}/profile`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// 3. Upload Profile Image
export async function uploadProfileImageApi(file: File): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient<FileUploadResponse>(`${BASE_URL}/profile/image`, {
    method: "POST",
    body: formData,
  });
}

// 4. Upload Intro Video
export async function uploadIntroVideoApi(file: File): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient<FileUploadResponse>(`${BASE_URL}/profile/intro-video`, {
    method: "POST",
    body: formData,
  });
}

// 5. Upload Document
export async function uploadDocumentApi(file: File, title: string, category: string): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("category", category);

  return apiClient<any>(`${BASE_URL}/profile/documents`, {
    method: "POST",
    body: formData,
  });
}

// 6. Get Dashboard Data
export async function getExpertDashboardApi(): Promise<DashboardResponse> {
  return apiClient<DashboardResponse>(`${BASE_URL}/dashboard`, {
    method: "GET",
  });
}
