"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Save, Download, FileText, Building, UserCircle } from "lucide-react";
import { saveCoverLetter } from "@/actions/cover-letter";

export default function CoverLetterClient({ resumeContent, userData }) {

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [file, setFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

  const generateLetter = async () => {

    if (!file || !company || !position) {
      alert("Upload resume and enter company & position");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("company", company);
    formData.append("position", position);

    setLoading(true);

    try {
      const res = await fetch("/api/generate-cover-letter", {
        method: "POST",
        body: formData
      });
  
      const data = await res.json();
      if (data.letter) {
         setCoverLetter(data.letter);
      } else if (data.error) {
         alert("Error: " + data.error);
      }
    } catch (e) {
      alert("Failed to generate cover letter.");
    }

    setLoading(false);
  };

  const downloadLetter = () => {
    const blob = new Blob([coverLetter], { type: "text/plain" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "cover-letter.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!coverLetter) return;

    await saveCoverLetter({
      company,
      position,
      content: coverLetter,
    });

    alert("Cover letter saved!");
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl space-y-8">

      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          AI Cover Letter <span className="text-primary">Generator</span>
        </h1>

        <p className="text-muted-foreground text-lg">
          Craft a perfect cover letter tailored to your dream job using AI. Upload your resume and let us do the rest.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">

        {/* LEFT: Generator Form */}
        <Card className="shadow-lg border-muted/50 transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="h-6 w-6 text-primary" />
              Job Details
            </CardTitle>
            <CardDescription>
              Provide your target position and company to generate a tailored cover letter.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="resume" className="text-sm font-semibold">Upload Resume (PDF, DOC, TXT)</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="cursor-pointer file:text-primary file:font-semibold"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" /> Company Name
              </Label>
              <Input
                id="company"
                type="text"
                placeholder="e.g. Google, Microsoft, Startup Inc."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-semibold flex items-center gap-2">
                <UserCircle className="h-4 w-4" /> Position Title
              </Label>
              <Input
                id="position"
                type="text"
                placeholder="e.g. Frontend Developer, Product Manager"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

          </CardContent>

          <CardFooter>
            <Button 
                onClick={generateLetter} 
                className="w-full h-12 text-md font-semibold transition-transform hover:scale-[1.02]"
                disabled={loading}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {loading ? "Analyzing Profile & Generating..." : "Generate Cover Letter"}
            </Button>
          </CardFooter>
        </Card>

        {/* RIGHT: Generated Output */}
        <Card className="shadow-lg border-muted/50 lg:sticky lg:top-8 flex flex-col h-full min-h-[600px] transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-2xl flex items-center justify-between">
              Your Cover Letter
              {coverLetter && (
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 font-medium tracking-wide">Ready</span>
              )}
            </CardTitle>
            <CardDescription>
              Review, edit, and save your generated cover letter.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-grow p-0 relative h-[400px]">
            {coverLetter ? (
               <Textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full h-full p-6 resize-none border-0 focus-visible:ring-0 text-sm leading-relaxed rounded-none shadow-none focus-visible:ring-offset-0"
                  placeholder="Your cover letter will appear here..."
               />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                   <FileText className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm max-w-xs">
                  Fill out the form on the left and hit generate to draft an outstanding cover letter.
                </p>
              </div>
            )}
          </CardContent>

          {coverLetter && (
            <CardFooter className="bg-muted/30 border-t p-4 flex gap-3 flex-wrap">
              <Button onClick={handleSave} className="flex-1 min-w-[120px]" variant="default">
                <Save className="h-4 w-4 mr-2" /> Save Letter
              </Button>
              <Button onClick={downloadLetter} className="flex-1 min-w-[120px]" variant="outline">
                <Download className="h-4 w-4 mr-2" /> Download TXT
              </Button>
            </CardFooter>
          )}
        </Card>

      </div>
    </div>
  );
}