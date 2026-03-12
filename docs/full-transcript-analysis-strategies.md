# Full Transcript Analysis - Implementation Strategies

## The Challenge

**Problem**: A 3-hour video has ~175,000 characters (~45,000 tokens), but most AI models have context limits:
- Groq (Llama 3.3 70B): 32k tokens ❌
- GPT-4o: 128k tokens ✅
- Claude 3.5 Sonnet: 200k tokens ✅
- Gemini 1.5 Pro: 1M tokens ✅✅✅

Current approach only sends 11k chars (3k tokens) - just 6% of content!

---

## Strategy 1: Use Long-Context Models 🎯 **EASIEST**

### The Idea
Simply use AI models with massive context windows that can swallow the entire transcript.

### Implementation
```typescript
// Already supported in our system!
if (transcript.length > 150000) {
  // Use Gemini 1.5 Pro (1M token context)
  // or Claude 3.5 Sonnet (200k tokens)
  const fullAnalysis = await ai.complete(fullTranscript)
}
```

### Models That Can Handle It

| Model | Context Window | Cost per 1M input tokens | Can Handle 3hr Video? |
|-------|---------------|--------------------------|----------------------|
| **Gemini 1.5 Pro** | 1M tokens | $1.25 | ✅ YES (4+ hours easy) |
| **Gemini 1.5 Flash** | 1M tokens | $0.075 | ✅ YES (cheapest!) |
| **Claude 3.5 Sonnet** | 200k tokens | $3.00 | ✅ YES (2-3 hours) |
| GPT-4o | 128k tokens | $2.50 | ⚠️ Partial (1.5-2 hours) |
| Llama 3.3 70B (Groq) | 32k tokens | Free | ❌ NO |

### Pros
- ✅ Simple to implement
- ✅ AI sees EVERYTHING
- ✅ Most accurate segmentation
- ✅ Understands full context and flow

### Cons
- ❌ More expensive ($0.03-0.05 per video with Gemini Flash)
- ❌ Slower (20-40 seconds analysis time)
- ❌ Not all providers support it

### Cost Example
```
Gemini 1.5 Flash:
- 175k chars ≈ 45k tokens
- Input cost: $0.075 per 1M tokens
- Per video: 45k × $0.075 / 1M = $0.0034
- 100 videos: $0.34/day

Current sampling approach:
- 11k chars ≈ 3k tokens  
- Per video: $0.0002
- 100 videos: $0.02/day

Difference: $0.32/day = $10/month for 100 videos/day
```

**Verdict**: Totally affordable! Gemini 1.5 Flash makes this viable.

---

## Strategy 2: Chunked Processing with Overlap 🧩

### The Idea
Split transcript into chunks, process each with overlap, then merge insights.

### Implementation
```typescript
async function chunkAnalysis(transcript: string) {
  const chunkSize = 15000 // chars
  const overlap = 2000    // overlap between chunks
  const chunks: string[] = []
  
  for (let i = 0; i < transcript.length; i += chunkSize - overlap) {
    chunks.push(transcript.slice(i, i + chunkSize))
  }
  
  // Process each chunk
  const chunkResults = []
  for (const chunk of chunks) {
    const result = await ai.analyzeChunk(chunk, chunkResults)
    chunkResults.push(result)
  }
  
  // Merge insights
  return ai.mergeChunkInsights(chunkResults)
}
```

### Visual
```
Transcript: [==========================================] 175k chars

Chunk 1: [=======]
Chunk 2:    [=======]  ← overlap
Chunk 3:       [=======]  ← overlap
Chunk 4:          [=======]
...
Chunk 12:                            [=======]

Each chunk: 15k chars
Overlap: 2k chars
Total chunks: ~12 chunks
```

### Pros
- ✅ Works with any model (even 32k context)
- ✅ Maintains continuity via overlap
- ✅ Can run chunks in parallel (faster!)
- ✅ Progressive understanding

### Cons
- ❌ Complex implementation
- ❌ Multiple API calls (12x cost)
- ❌ May miss long-range patterns
- ❌ Merging insights is tricky

### Cost
```
12 chunks × $0.01 per chunk = $0.12 per video
vs
1 call with Gemini Flash = $0.0034 per video

35x more expensive than Strategy 1! ❌
```

---

## Strategy 3: Two-Stage Hierarchical Analysis 📊

### The Idea
1. **Stage 1**: Generate comprehensive summary of entire transcript
2. **Stage 2**: Use summary + original segments for article generation

### Implementation
```typescript
// Stage 1: Summarization (with long-context model)
const summary = await ai.summarizeTranscript(fullTranscript)
// Output: 3k char summary covering all topics

// Stage 2: Segment detection using summary
const segments = await ai.detectSegments(summary, metadata)

// Stage 3: Generate articles with both summary + actual segment
for (const segment of segments) {
  const segmentText = transcript.slice(segment.start, segment.end)
  const article = await ai.generateArticle({
    summary: summary,        // Full context
    segmentText: segmentText, // Specific content
    segmentInfo: segment      // What this part is about
  })
}
```

### Flow
```
Full Transcript (175k)
       ↓
┌──────────────────┐
│ Stage 1: Summary │ ← Long-context model
│  (Gemini Flash)  │
└──────────────────┘
       ↓
Summary (3k chars)
       ↓
┌──────────────────┐
│ Stage 2: Segments│ ← Fast analysis
│  (Groq/Cheap)    │
└──────────────────┘
       ↓
Segments [1, 2, 3, 4]
       ↓
┌──────────────────┐
│ Stage 3: Articles│ ← With summary context!
│  Summary + Text  │
└──────────────────┘
```

### Pros
- ✅ Best of both worlds
- ✅ Full context via summary
- ✅ Accurate segmentation
- ✅ Still relatively cheap

### Cons
- ⚠️ Requires 2 API calls (summary + generation)
- ⚠️ Summary might lose nuances
- ⚠️ More complex orchestration

### Cost
```
Stage 1 (Gemini Flash): $0.0034
Stage 2 (Groq/free): $0
Stage 3 per article (×4): $0.04

Total: ~$0.044 per video
Still cheaper than chunked approach!
```

---

## Strategy 4: Smart Sampling++ 🎯 **IMPROVED CURRENT**

### The Idea
Improve current approach by sampling more strategic sections.

### Implementation
```typescript
async function smartSample(transcript: string) {
  const length = transcript.length
  
  // Sample 5 sections instead of 2
  const samples = [
    transcript.slice(0, 8000),           // Opening (0-5%)
    transcript.slice(length * 0.25, length * 0.25 + 5000), // First quarter
    transcript.slice(length * 0.5, length * 0.5 + 5000),   // Middle
    transcript.slice(length * 0.75, length * 0.75 + 5000), // Last quarter
    transcript.slice(-3000)              // Ending
  ]
  
  // Total: 29k chars instead of 11k (26% of content vs 6%)
  return samples.join("\n\n... [section omitted] ...\n\n")
}
```

### Visual Coverage
```
Current (6% coverage):
[XXXXX.....................................XXXX] 
 ↑ opening                          ending ↑

Smart Sampling++ (26% coverage):
[XXXXX.......XXX.......XXX.......XXX.......XXXX]
 ↑ open     Q1       mid      Q3      end ↑
```

### Pros
- ✅ Easy upgrade to current system
- ✅ 4x better coverage
- ✅ Minimal cost increase
- ✅ Works with any model

### Cons
- ❌ Still missing 74% of content
- ⚠️ May miss important middle sections
- ⚠️ Not true "full context"

### Cost
```
29k chars ≈ 7.5k tokens
Cost: ~$0.003 per video
3x current cost but still very cheap!
```

---

## Strategy 5: Vector DB + RAG Approach 🔍 **ADVANCED**

### The Idea
Store transcript in vector database, use semantic search to retrieve relevant context.

### Implementation
```typescript
// 1. Embed transcript in chunks
const embeddings = await embedTranscript(transcript, {
  chunkSize: 1000,
  overlap: 200
})

// 2. Store in vector DB (e.g., Pinecone, Weaviate)
await vectorDB.store(videoId, embeddings)

// 3. When generating articles, retrieve relevant chunks
for (const segment of segments) {
  const relevantChunks = await vectorDB.search(segment.topic, topK=10)
  const article = await ai.generateArticle({
    mainContent: segment.text,
    relatedContext: relevantChunks // Retrieved relevant sections
  })
}
```

### Pros
- ✅ Dynamic context retrieval
- ✅ Handles unlimited length
- ✅ Can reference related sections
- ✅ Powerful for multi-video projects

### Cons
- ❌ Complex infrastructure (vector DB)
- ❌ Additional embedding costs
- ❌ Requires maintenance
- ❌ Overkill for single-video processing

### Cost
```
Embedding (OpenAI ada-002): ~$0.01 per video
Vector DB storage: $0.001/GB/month
Processing: $0.03 per video

Total: ~$0.04 per video + infrastructure
```

---

## Strategy 6: Hybrid Approach 🎯 **RECOMMENDED**

### The Idea
Combine the best strategies based on video length.

### Decision Tree
```
Video Analysis
      ↓
   Duration?
      ↓
  ┌───┴────┐
  │        │
< 90 min   > 90 min
  │        │
  ↓        ↓
Quick   Long Video?
Sample      ↓
         ┌──┴───┐
         │      │
     < 2.5hr  > 2.5hr
         │      │
         ↓      ↓
      Strategy Strategy
         3        1
    (2-stage) (Full Context
    summary  with Gemini)
```

### Implementation
```typescript
async function analyzeVideo(transcript: string, duration: number) {
  if (duration < 90 * 60) {
    // Short video: Current approach
    return quickSample(transcript)
  }
  
  if (duration < 150 * 60) {
    // 90-150 min: Two-stage with summary
    return twoStageAnalysis(transcript)
  }
  
  // 150+ min: Full context with Gemini Flash
  return fullContextAnalysis(transcript, 'gemini-1.5-flash')
}
```

### Pros
- ✅ Optimal cost/accuracy tradeoff
- ✅ Scales automatically
- ✅ Uses best approach per case
- ✅ Future-proof

### Cons
- ⚠️ More code complexity
- ⚠️ Requires multiple providers

### Cost Breakdown
```
≤ 90 min videos (70%): $0.001 each
90-150 min (20%): $0.044 each  
150+ min (10%): $0.0034 each

Average: ~$0.01 per video
100 videos/day = $1/day = $30/month
```

---

## Recommended Implementation Plan

### Phase 1: Quick Win (1-2 hours) ✅
Add **Gemini 1.5 Flash** support for videos > 2.5 hours
```typescript
if (duration > 150 * 60 && transcript.length > 150000) {
  // Use Gemini 1.5 Flash for full context
  return fullAnalysisWithGemini(transcript)
}
```

**Impact**: Massive accuracy boost for long videos, minimal cost ($0.003/video)

### Phase 2: Smart Sampling++ (2-3 hours)
Improve sampling for 90-150 min videos
```typescript
return smartSample5Points(transcript) // 26% coverage vs 6%
```

**Impact**: 4x better context understanding, still cheap

### Phase 3: Two-Stage Pipeline (1 day)
Add summarization stage for comprehensive context
```typescript
const summary = await ai.summarize(transcript)
const segments = await ai.detectWithContext(summary)
```

**Impact**: Best accuracy without full-context models

### Phase 4: Hybrid Router (optional)
Smart decision tree based on video characteristics

---

## Technical Implementation (Phase 1)

### 1. Add Gemini to Providers

```typescript
// apps/server/src/services/ai.service.ts

function getGeminiClient() {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set")
  return new OpenAI({
    apiKey: env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
  })
}
```

### 2. Update AI Config Types

```typescript
// packages/types/src/ai.types.ts

export type AIProvider = "AZURE_OPENAI" | "GROQ" | "OPENROUTER" | "GEMINI"

export const AI_PROVIDER_MODELS = {
  GEMINI: [
    { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash (1M context)" },
    { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro (1M context)" }
  ]
}
```

### 3. Update Analysis Logic

```typescript
async analyzeAndSplitTranscript(transcript: string, videoMeta) {
  const shouldUseFullContext = 
    transcript.length > 150000 || 
    videoMeta.duration > 150 * 60

  if (shouldUseFullContext) {
    console.log('[ai] Using full-context analysis (Gemini 1.5 Flash)')
    return this.fullContextAnalysis(transcript, videoMeta)
  }
  
  // Fallback to sampling
  return this.samplingAnalysis(transcript, videoMeta)
}

async fullContextAnalysis(transcript: string, videoMeta) {
  const prompt = `Analyze this COMPLETE video transcript and identify distinct topic segments...

FULL TRANSCRIPT (${transcript.length} characters):
${transcript}

VIDEO METADATA:
Title: ${videoMeta.title}
Duration: ${Math.round(videoMeta.duration / 60)} minutes

Return JSON with 2-5 segments...`

  const result = await this.complete(prompt)
  return JSON.parse(result)
}
```

---

## Decision Matrix: Which Strategy?

| Your Need | Best Strategy | Reason |
|-----------|--------------|---------|
| **Maximum accuracy** | Strategy 1 (Gemini) | Sees everything |
| **Lowest cost** | Strategy 4 (Smart Sample++) | 4x better, still cheap |
| **Best balance** | Strategy 6 (Hybrid) | Right tool per video |
| **Works everywhere** | Strategy 2 (Chunks) | No context limits |
| **Multi-video corpus** | Strategy 5 (Vector RAG) | Cross-video insights |

---

## My Recommendation: Start with Strategy 6 (Hybrid) 🎯

```typescript
// Pseudo-code for hybrid approach
if (duration < 90min) {
  quickSample() // $0.001, 5 sec
}
else if (duration < 150min) {
  smartSample++() // $0.003, 8 sec  
}
else {
  geminiFullContext() // $0.003, 15 sec
}
```

**Why?**
- ✅ Best accuracy per dollar spent
- ✅ Scales automatically
- ✅ Easy to implement (Phase 1 = 2 hours)
- ✅ Only $30/month for 100 videos/day
- ✅ Can always add vector RAG later if needed

---

## Next Steps

1. **Add Gemini API key** to `.env`
2. **Update AI provider enum** to include GEMINI
3. **Add Gemini client** to ai.service.ts
4. **Add full-context analysis method**
5. **Update analysis router** with hybrid logic
6. **Test with 3+ hour video**

Want me to implement Phase 1 (Gemini integration) right now? It'll take ~30 minutes and solve your problem! 🚀
