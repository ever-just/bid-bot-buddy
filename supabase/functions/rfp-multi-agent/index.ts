
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.27.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RFPContent {
  url: string
  title?: string
  content?: {
    text: {
      full_text: string
      headings: Array<{ level: number; text: string }>
      paragraphs: string[]
    }
  }
  statistics?: {
    text_length: number
  }
}

interface AgentProgress {
  agentId: number
  progress: number
  status: 'pending' | 'running' | 'completed' | 'error'
  result?: string
}

const agentDefinitions = [
  {
    id: 1,
    name: "Requirements Analyst",
    description: "Extract and analyze requirements from RFP",
    tool_name: "analyze_requirements",
    prompt: "You are a Requirements Analyst AI. Analyze the RFP content and extract all technical requirements, functional requirements, and project specifications. Focus on identifying must-have vs nice-to-have requirements, technical constraints, and deliverables."
  },
  {
    id: 2,
    name: "Market Researcher", 
    description: "Research market conditions and competitive landscape",
    tool_name: "research_market",
    prompt: "You are a Market Research AI. Analyze the RFP to understand the market context, identify potential competitors, estimate market rates for similar services, and provide competitive intelligence that would help in positioning and pricing."
  },
  {
    id: 3,
    name: "Vendor Scout",
    description: "Identify potential subcontractors and partners",
    tool_name: "scout_vendors",
    prompt: "You are a Vendor Scout AI. Based on the RFP requirements, identify the types of subcontractors, vendors, or partners that would be needed. Suggest vendor categories, skill sets required, and partnership strategies."
  },
  {
    id: 4,
    name: "Cost Estimator",
    description: "Calculate pricing and cost estimates",
    tool_name: "estimate_costs",
    prompt: "You are a Cost Estimation AI. Analyze the RFP requirements and provide detailed cost estimates, pricing strategies, and budget breakdowns. Consider labor costs, materials, overhead, profit margins, and competitive pricing factors."
  },
  {
    id: 5,
    name: "Compliance Checker",
    description: "Verify regulatory and compliance requirements",
    tool_name: "check_compliance",
    prompt: "You are a Compliance Checker AI. Review the RFP for all compliance requirements, certifications needed, regulatory standards, security requirements, and legal obligations. Identify potential compliance risks and mitigation strategies."
  },
  {
    id: 6,
    name: "Proposal Generator",
    description: "Generate final proposal content",
    tool_name: "generate_proposal",
    prompt: "You are a Proposal Generation AI. Based on all the analysis from other agents, create a comprehensive proposal structure with executive summary, technical approach, timeline, team qualifications, and compelling value propositions."
  }
]

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
    })

    const { rfpContent, onProgress } = await req.json()

    console.log('Starting multi-agent RFP analysis for:', rfpContent.url)

    // Function to send progress updates (in a real implementation, you'd use WebSocket or Server-Sent Events)
    const sendProgress = (agentId: number, progress: number, status: string, result?: string) => {
      console.log(`Agent ${agentId} - ${status}: ${progress}% ${result ? '- ' + result.substring(0, 100) + '...' : ''}`)
    }

    // Define tools that Claude can use for each agent
    const tools = agentDefinitions.map(agent => ({
      name: agent.tool_name,
      description: `${agent.description} - ${agent.name}`,
      input_schema: {
        type: "object",
        properties: {
          rfp_content: {
            type: "string",
            description: "The full RFP content to analyze"
          },
          previous_results: {
            type: "string", 
            description: "Results from previous agents for context"
          }
        },
        required: ["rfp_content"]
      }
    }))

    const rfpText = rfpContent.content?.text?.full_text || ''
    const results: Record<string, string> = {}
    
    // Process each agent sequentially, building context
    for (const agent of agentDefinitions) {
      sendProgress(agent.id, 0, 'running')
      
      try {
        const previousContext = Object.entries(results)
          .map(([agentName, result]) => `${agentName}: ${result}`)
          .join('\n\n')

        const message = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 2000,
          system: agent.prompt,
          messages: [{
            role: "user",
            content: `Analyze this RFP content:

RFP URL: ${rfpContent.url}
RFP Title: ${rfpContent.title || 'Not specified'}

Full Content:
${rfpText}

${previousContext ? `\nContext from previous agents:\n${previousContext}` : ''}

Please provide a comprehensive analysis focused on your specific role as ${agent.name}.`
          }],
          tools: [{
            name: agent.tool_name,
            description: agent.description,
            input_schema: {
              type: "object",
              properties: {
                analysis: {
                  type: "string",
                  description: "Your detailed analysis result"
                }
              },
              required: ["analysis"]
            }
          }],
          tool_choice: { type: "tool", name: agent.tool_name }
        })

        // Extract the tool result
        const toolUse = message.content.find(content => content.type === 'tool_use')
        let analysisResult = ''
        
        if (toolUse && toolUse.type === 'tool_use') {
          analysisResult = (toolUse.input as any).analysis || message.content[0]?.text || 'Analysis completed'
        } else {
          analysisResult = message.content[0]?.text || 'Analysis completed'
        }

        results[agent.name] = analysisResult
        sendProgress(agent.id, 100, 'completed', analysisResult)
        
        // Simulate processing time for better UX
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`Error in ${agent.name}:`, error)
        const errorMsg = `Error in analysis: ${error.message}`
        results[agent.name] = errorMsg
        sendProgress(agent.id, 100, 'error', errorMsg)
      }
    }

    // Generate final analysis summary
    const finalSummary = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 3000,
      system: "You are a senior project manager summarizing the multi-agent analysis of an RFP. Create a comprehensive executive summary.",
      messages: [{
        role: "user",
        content: `Based on the following agent analyses, create a comprehensive RFP analysis summary:

${Object.entries(results).map(([agent, result]) => `${agent}:\n${result}\n`).join('\n---\n')}

Provide an executive summary with key findings, recommendations, and next steps.`
      }]
    })

    const executiveSummary = finalSummary.content[0]?.text || 'Summary generation completed'

    return new Response(
      JSON.stringify({
        success: true,
        results: results,
        executive_summary: executiveSummary,
        agents_completed: agentDefinitions.length,
        rfp_url: rfpContent.url
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in multi-agent analysis:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    )
  }
})
