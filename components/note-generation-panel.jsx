"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ChapterSelector } from "./chapter-selector"
import { GeneratedNotesDisplay } from "./generated-notes-display"
import { startGeneration, completeGeneration, failGeneration, clearError } from "@/lib/slices/noteGenerationSlice"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

// Mock AI note generation function
const generateNotesWithAI = async (chapters, fileName) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sampleNotes = {
        "Chapter 1: Introduction to Calculus": `
📌 KEY CONCEPTS:
• Calculus is the mathematical study of continuous change
• Two main branches: Differential and Integral Calculus
• Foundation for physics, engineering, and economics

📚 MAIN TOPICS:
1. Functions and their properties
   - Domain and range
   - Continuity and discontinuity
   - Composite functions

2. Limits
   - Formal definition of limits
   - One-sided limits
   - Infinite limits

3. Derivatives
   - Rate of change
   - Tangent lines
   - Power rule, product rule, chain rule

💡 IMPORTANT FORMULAS:
• Limit definition: lim(x→a) f(x) = L
• Derivative: f'(x) = lim(h→0) [f(x+h) - f(x)]/h
• Power rule: d/dx(x^n) = nx^(n-1)

⚠️ COMMON MISTAKES:
• Confusing limits with function values
• Forgetting chain rule in composite functions
• Incorrect application of product rule

🎯 PRACTICE PROBLEMS:
1. Find the limit of (x² - 1)/(x - 1) as x approaches 1
2. Differentiate f(x) = 3x⁴ + 2x² - 5
3. Find the derivative of g(x) = (2x + 1)³
        `,
        "Chapter 2: Limits and Continuity": `
📌 KEY CONCEPTS:
• Limits describe the value a function approaches
• Continuity requires limits to exist and equal function value
• Essential for understanding derivatives

📚 MAIN TOPICS:
1. Limit Laws
   - Sum, product, quotient rules
   - Power and root rules
   - Squeeze theorem

2. Continuity
   - Continuous at a point
   - Continuous on an interval
   - Types of discontinuities

3. Intermediate Value Theorem
   - Statement and proof
   - Applications
   - Finding roots

💡 IMPORTANT THEOREMS:
• Squeeze Theorem: If g(x) ≤ f(x) ≤ h(x) and lim g = lim h = L, then lim f = L
• IVT: If f is continuous on [a,b] and k is between f(a) and f(b), then ∃c where f(c) = k

⚠️ COMMON MISTAKES:
• Assuming limit exists without checking both sides
• Confusing removable and non-removable discontinuities
• Incorrect application of limit laws

🎯 PRACTICE PROBLEMS:
1. Evaluate lim(x→2) (x² + 3x - 1)
2. Determine if f(x) = |x|/x is continuous at x = 0
3. Use IVT to show x³ - 2x = 1 has a solution
        `,
        "Chapter 3: Derivatives": `
📌 KEY CONCEPTS:
• Derivative measures instantaneous rate of change
• Geometrically represents slope of tangent line
• Foundation for optimization and motion analysis

📚 MAIN TOPICS:
1. Derivative Rules
   - Power rule
   - Product rule: (fg)' = f'g + fg'
   - Quotient rule: (f/g)' = (f'g - fg')/g²
   - Chain rule: (f∘g)' = f'(g)·g'

2. Implicit Differentiation
   - Differentiating both sides
   - Solving for dy/dx
   - Related rates

3. Higher Order Derivatives
   - Second derivative
   - Concavity and inflection points
   - Acceleration

💡 IMPORTANT FORMULAS:
• d/dx(sin x) = cos x
• d/dx(cos x) = -sin x
• d/dx(e^x) = e^x
• d/dx(ln x) = 1/x

⚠️ COMMON MISTAKES:
• Forgetting chain rule with composite functions
• Incorrect quotient rule application
• Sign errors in derivatives

🎯 PRACTICE PROBLEMS:
1. Find f'(x) for f(x) = (3x² + 2)⁵
2. Differentiate y = x·sin(x) using product rule
3. Find d²y/dx² for y = x³ - 2x² + 5x
        `,
      }

      const generatedContent = chapters
        .map((ch) => sampleNotes[ch] || `Notes for ${ch}`)
        .join("\n\n" + "=".repeat(50) + "\n\n")

      resolve(generatedContent)
    }, 2000)
  })
}

export function NoteGenerationPanel({ fileId, fileName }) {
  const dispatch = useDispatch()
  const { isGenerating, error, generatedNotes, currentGeneration } = useSelector((state) => state.noteGeneration)

  const handleGenerate = async (selectedChapters) => {
    dispatch(
      startGeneration({
        fileId,
        fileName,
        chapters: selectedChapters,
      }),
    )

    try {
      const content = await generateNotesWithAI(selectedChapters, fileName)
      dispatch(completeGeneration({ content }))
    } catch (err) {
      dispatch(failGeneration(err.message || "Failed to generate notes"))
    }
  }

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, dispatch])

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Generation Failed</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chapter Selector */}
      <ChapterSelector fileId={fileId} onGenerate={handleGenerate} isGenerating={isGenerating} />

      {/* Current Generation Loading State */}
      {isGenerating && currentGeneration && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Generating concise notes...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Processing {currentGeneration.chapters.length} chapter
                  {currentGeneration.chapters.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Notes History */}
      {generatedNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Generated Notes History</h3>
          {generatedNotes.map((note) => (
            <GeneratedNotesDisplay key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}
