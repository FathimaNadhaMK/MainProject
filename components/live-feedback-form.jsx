"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Star, User, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { submitReview, getUserReview } from "@/actions/reviews";

export default function LiveFeedbackForm() {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [name, setName] = useState("");
    const [review, setReview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchExistingReview() {
            const existing = await getUserReview();
            if (existing) {
                setRating(existing.rating);
                setName(existing.name !== "Anonymous User" ? existing.name : "");
                setReview(existing.review);
                setIsEditing(true);
            }
        }
        fetchExistingReview();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast({
                title: "Rating required",
                description: "Please select a star rating before submitting.",
                variant: "destructive"
            });
            return;
        }

        if (!review.trim()) {
            toast({
                title: "Review required",
                description: "Please write a short review before submitting.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        const res = await submitReview({ rating, name, review });

        setIsSubmitting(false);

        if (res.success) {
            setIsEditing(true); // If it was new, now they are editing it
            toast({
                title: isEditing ? "Review updated!" : "Thank you for your feedback!",
                description: res.message,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Submission failed",
                description: res.error || "Failed to submit review. Try again.",
            });
        }
    };

    return (
        <section className="w-full py-12 md:py-24 bg-background border-t border-border/40">
            <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">{isEditing ? "Update Your Review" : "Leave a Review"}</h2>
                    <p className="text-muted-foreground">
                        We value your feedback. Help us improve by sharing your experience!
                    </p>
                </div>

                <Card className="border-2 lg:p-4 bg-muted/30">
                    <CardHeader>
                        <CardTitle>{isEditing ? "Modify Your Experience" : "Share Your Experience"}</CardTitle>
                        <CardDescription>
                            Your review helps others discover the best career guidance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Star Rating */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Overall Rating</label>
                                <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={`transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-full p-1`}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                        >
                                            <Star
                                                className={`h-8 w-8 ${(hoverRating || rating) >= star
                                                    ? "fill-primary text-primary"
                                                    : "text-muted-foreground/40"
                                                    } transition-all`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Name Input */}
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">Name (Optional)</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        className="pl-10 bg-background"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Review Textarea */}
                            <div className="space-y-2">
                                <label htmlFor="review" className="text-sm font-medium">Your Review <span className="text-red-500">*</span></label>
                                <Textarea
                                    id="review"
                                    placeholder="Tell us what you liked or how we can improve..."
                                    className="min-h-[120px] resize-y bg-background"
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin"></span>
                                        {isEditing ? "Updating..." : "Submitting..."}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {isEditing ? <RefreshCw className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                                        {isEditing ? "Update Feedback" : "Submit Feedback"}
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
