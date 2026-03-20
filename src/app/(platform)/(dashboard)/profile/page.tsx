"use client";

import ProfileForm from "@/components/dashboard/profile-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle, Eye, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getExpertProfileApi, ExpertError } from "@/client/api/expert";

type ProfileData = {
  user: {
    name: string;
    email: string;
    username: string;
    image: string;
  };
  isVetted: boolean;
  hasPendingUpdates: boolean;
  rejectionReason: string | null;
  draft: Record<string, any>;
  introVideo?: string;
  bio?: string;
  specialization?: string;
  experience?: number;
  consultationFee?: number;
  languages?: string[];
  education?: any[];
  profileImage?: string;
  // Additional fields
  timezone?: string;
  gender?: string;
  location?: string;
  socialLinks?: Record<string, string>;
  tags?: string[];
  workHistory?: any[];
  services?: any[];
  documents?: any[];
  availability?: any[];
  leaves?: any[];
  fieldStatuses?: Record<string, { value: any; status: string }>;
  verificationStatus?: string;
};

function ProfileContent() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const profileData = await getExpertProfileApi();
        
        // Transform API response to match UI expected format
        const transformedProfile: ProfileData = {
          user: {
            name: profileData.name,
            email: profileData.email,
            username: profileData.username,
            image: profileData.profileImage || profileData.image || "",
          },
          isVetted: profileData.verificationStatus === "LIVE",
          hasPendingUpdates: profileData.hasPendingUpdates,
          rejectionReason: profileData.rejectionReason,
          draft: {}, // TODO: Implement draft functionality if needed
          introVideo: profileData.introVideo || undefined,
          bio: profileData.bio || undefined,
          specialization: profileData.specialization || undefined,
          experience: profileData.experience || undefined,
          consultationFee: profileData.consultationFee || undefined,
          languages: profileData.languages || undefined,
          education: profileData.education || undefined,
          profileImage: profileData.profileImage || undefined,
          // Additional fields
          timezone: profileData.timezone || undefined,
          gender: profileData.gender || undefined,
          location: profileData.location || undefined,
          socialLinks: profileData.socialLinks || {},
          tags: profileData.tags || [],
          workHistory: profileData.workHistory || [],
          services: profileData.services || [],
          documents: profileData.documents || [],
          availability: profileData.availability || [],
          leaves: profileData.leaves || [],
          fieldStatuses: profileData.fieldStatuses,
          verificationStatus: profileData.verificationStatus || "ONBOARDING",
        };

        setProfile(transformedProfile);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        if (err instanceof ExpertError) {
          setError(err.message);
        } else {
          setError("Failed to load profile. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 2. Determine Active Tab
  const validTabs = [
    "identity",
    "professional",
    "services",
    "availability",
    "documents",
    "settings"
  ];

  const tabParam = searchParams?.get("tab") || null;
  const activeTab =
    (tabParam && validTabs.includes(tabParam))
      ? tabParam
      : "identity";

  if (isLoading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <XCircle className="h-5 w-5" />
          <AlertTitle className="font-bold">Error</AlertTitle>
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8 text-center">No profile data found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-zinc-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Expert Profile
          </h1>
          <p className="text-zinc-500 mt-1">
            Manage your public presence and settings.
          </p>
        </div>

        {/* Public View Button */}
        {profile.isVetted && (
          <Button variant="outline" asChild className="gap-2 border-zinc-200">
            <Link href={`/experts/${profile.user.username}`} target="_blank">
              <Eye className="h-4 w-4" /> Public View
            </Link>
          </Button>
        )}
      </div>

      {/* REJECTION ALERT */}
      {profile.rejectionReason && (
        <Alert
          variant="destructive"
          className="bg-red-50 border-red-200 text-red-900"
        >
          <XCircle className="h-5 w-5 text-red-600" />
          <div className="ml-2">
            <AlertTitle className="font-bold">Action Required</AlertTitle>
            <AlertDescription className="text-sm mt-1">
              {profile.rejectionReason}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* PENDING UPDATES ALERT */}
      {profile.hasPendingUpdates && (
        <Alert
          variant="default"
          className="bg-amber-50 border-amber-200 text-amber-900"
        >
          <Clock className="h-5 w-5 text-amber-600" />
          <div className="ml-2">
            <AlertTitle className="font-bold">Updates Pending Approval</AlertTitle>
            <AlertDescription className="text-sm mt-1">
              Your recent profile changes are currently under review by our admin team. 
              You'll be notified once they're approved. Your updates include: gender, location, and other profile information.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* VERIFICATION STATUS ALERT */}
      {!profile.isVetted && !profile.rejectionReason && (
        <Alert
          variant="default"
          className="bg-blue-50 border-blue-200 text-blue-900"
        >
          <CheckCircle className="h-5 w-5 text-blue-600" />
          <div className="ml-2">
            <AlertTitle className="font-bold">Profile Under Review</AlertTitle>
            <AlertDescription className="text-sm mt-1">
              Your profile is currently being reviewed. Complete all sections and submit for verification to go live.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* MAIN FORM */}
      <ProfileForm
        initialData={profile}
        isPending={profile.hasPendingUpdates}
        initialTab={activeTab} // SSR-safe tab
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
