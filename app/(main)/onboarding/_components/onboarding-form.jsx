"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useFetch from "@/hooks/use-fetch";
import { onboardingSchema } from "@/app/lib/schema";
import { updateUser } from "@/actions/user";

const OnboardingForm = ({ industries }) => {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  const { loading: updateLoading, fn: updateUserFn, data: updateResult } =
    useFetch(updateUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
  });

  const onSubmit = async (values) => {
    try {
      const formattedIndustry = `${values.industry}-${values.subIndustry
        .toLowerCase()
        .replace(/ /g, "-")}`;
      await updateUserFn({ ...values, industry: formattedIndustry });
    } catch (error) {
      console.error("Onboarding error:", error);
    }
  };

  useEffect(() => {
    if (updateResult?.success && !updateLoading) {
      toast.success("Profile completed successfully!");
      router.push("/dashboard");
      router.refresh();
    }
  }, [updateResult, updateLoading]);

  const watchIndustry = watch("industry");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#020617] to-black relative overflow-hidden px-6">
      
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-24 left-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      {/* Outer card */}
      <Card
        className="
        relative z-10
        w-full max-w-3xl
        bg-black/40 backdrop-blur-xl
        border border-white/10
        rounded-2xl
        shadow-[0_0_40px_rgba(59,130,246,0.25)]
        "
      >
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-white">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-gray-400">
            Select your industry to get personalized career insights and recommendations
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Inner form box */}
          <div className="bg-black/30 border border-white/10 rounded-xl p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Industry */}
              <div className="space-y-2">
                <Label className="text-gray-300">Industry</Label>
                <Select
                  onValueChange={(value) => {
                    setValue("industry", value);
                    setSelectedIndustry(
                      industries.find((ind) => ind.id === value)
                    );
                    setValue("subIndustry", "");
                  }}
                >
                  <SelectTrigger className="bg-gray-900 text-white border-white/10">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 text-white">
                    <SelectGroup>
                      <SelectLabel>Industries</SelectLabel>
                      {industries.map((ind) => (
                        <SelectItem key={ind.id} value={ind.id}>
                          {ind.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-sm text-red-500">{errors.industry.message}</p>
                )}
              </div>

              {/* Sub Industry */}
              {watchIndustry && (
                <div className="space-y-2">
                  <Label className="text-gray-300">Specialization</Label>
                  <Select onValueChange={(value) => setValue("subIndustry", value)}>
                    <SelectTrigger className="bg-gray-900 text-white border-white/10">
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 text-white">
                      {selectedIndustry?.subIndustries.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Experience */}
              <div className="space-y-2">
                <Label className="text-gray-300">Years of Experience</Label>
                <Input
                  type="number"
                  {...register("experience")}
                  className="bg-gray-900 text-white border-white/10"
                />
              </div>

              {/* Education */}
              <div className="space-y-2">
                <Label className="text-gray-300">Education Level</Label>
                <Select onValueChange={(v) => setValue("educationLevel", v)}>
                  <SelectTrigger className="bg-gray-900 text-white border-white/10">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 text-white">
                    <SelectItem value="Diploma">Diploma</SelectItem>
                    <SelectItem value="Graduate">Graduate</SelectItem>
                    <SelectItem value="Post Graduate">Post Graduate</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Background */}
              <div className="space-y-2">
                <Label className="text-gray-300">Background</Label>
                <Input
                  {...register("background")}
                  className="bg-gray-900 text-white border-white/10"
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label className="text-gray-300">Skills</Label>
                <Input
                  {...register("skills")}
                  className="bg-gray-900 text-white border-white/10"
                />
              </div>

              {/* Target Role */}
              <div className="space-y-2">
                <Label className="text-gray-300">Target Role</Label>
                <Input
                  {...register("targetRole")}
                  className="bg-gray-900 text-white border-white/10"
                />
              </div>

              {/* Target Companies */}
              <div className="space-y-2">
                <Label className="text-gray-300">Target Companies</Label>
                <Input
                  {...register("targetCompanies")}
                  className="bg-gray-900 text-white border-white/10"
                />
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <Label className="text-gray-300">Preferred Company Size</Label>
                <Select onValueChange={(v) => setValue("companySizePref", v)}>
                  <SelectTrigger className="bg-gray-900 text-white border-white/10">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 text-white">
                    <SelectItem value="Startup (1–50)">Startup (1–50)</SelectItem>
                    <SelectItem value="Small (51–200)">Small (51–200)</SelectItem>
                    <SelectItem value="Mid-size (201–1000)">Mid-size (201–1000)</SelectItem>
                    <SelectItem value="Large (1000+)">Large (1000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-gray-300">Preferred Location</Label>
                <Input
                  {...register("locationPref")}
                  className="bg-gray-900 text-white border-white/10"
                />
              </div>

              {/* Internship */}
              <div className="space-y-2">
                <Label className="text-gray-300">Internship Interest</Label>
                <Input
                  {...register("internshipInterest")}
                  className="bg-gray-900 text-white border-white/10"
                />
              </div>

              {/* Certification */}
              <div className="flex items-center gap-3">
                <Input
                  type="checkbox"
                  {...register("certificationInterest")}
                  className="w-5 h-5 accent-blue-500"
                />
                <span className="text-gray-300 text-sm">
                  I am interested in certifications
                </span>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label className="text-gray-300">Professional Bio</Label>
                <Textarea
                  {...register("bio")}
                  className="bg-gray-900 text-white border-white/10 h-28"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={updateLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg"
              >
                {updateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </Button>

            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;
