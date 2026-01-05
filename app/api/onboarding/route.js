import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Get onboarding questions structure
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        requiredQuestions: {
          educationLevel: {
            label: "What's your education level?",
            options: ['Diploma', 'Graduate', 'Post Graduate', 'PhD'],
            type: 'select'
          },
          background: {
            label: "What's your background?",
            options: ['B.Com', 'B.Tech', 'Working Professional', 'Student', 'Other'],
            type: 'select'
          },
          targetRole: {
            label: "What role do you want?",
            options: ['SDE', 'Data Analyst', 'Product Manager', 'DevOps', 'ML Engineer', 'Other'],
            type: 'select'
          },
          skills: {
            label: "What skills do you have and their level?",
            description: "Select skills and rate your proficiency",
            levels: ['Basic', 'Medium', 'Good', 'Proficient'],
            type: 'tag-select'
          }
        },
        optionalQuestions: {
          targetCompanies: {
            label: "Target companies? (Optional)",
            options: ['Google', 'Microsoft', 'TCS', 'Infosys', 'Startups', 'Any Company'],
            type: 'multi-select'
          },
          companySizePref: {
            label: "Company size preference?",
            options: ['FAANG/Big Tech', 'Product Companies', 'Service Companies', 'Startups', 'No Preference'],
            type: 'select'
          },
          locationPref: {
            label: "Location preference?",
            placeholder: "Bangalore, Remote, USA, etc.",
            type: 'text'
          },
          internshipInterest: {
            label: "Interested in internships?",
            options: ['GSoC', 'Outreachy', 'Company Internships'],
            type: 'multi-select'
          },
          certificationInterest: {
            label: "Interested in certifications?",
            options: ['Yes', 'No'],
            type: 'select'
          }
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST: Save onboarding answers
export async function POST(request) {
  try {
    const data = await request.json();
    
    console.log('📝 Onboarding data received:', data);
    
    // Extract data
    const { clerkUserId, email, name, ...onboardingData } = data;
    
    if (!clerkUserId || !email) {
      return NextResponse.json({
        success: false,
        error: 'clerkUserId and email are required'
      }, { status: 400 });
    }
    
    // Save to database
    const user = await prisma.user.upsert({
      where: { clerkUserId },
      update: {
        ...onboardingData,
        updatedAt: new Date()
      },
      create: {
        clerkUserId,
        email,
        name: name || 'User',
        ...onboardingData
      }
    });
    
    // Create a UserActivity record
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'ONBOARDING_COMPLETED',
        module: 'onboarding',
        action: 'complete',
        details: {
          educationLevel: onboardingData.educationLevel,
          targetRole: onboardingData.targetRole,
          companiesSelected: onboardingData.targetCompanies || []
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Onboarding data saved successfully',
      data: {
        userId: user.id,
        nextStep: 'roadmap_generation',
        message: 'AI will now analyze your profile and generate a personalized roadmap'
      }
    });
    
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}