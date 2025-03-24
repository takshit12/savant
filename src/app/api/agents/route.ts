import { NextResponse } from 'next/server';
import { 
  getAllAgents, 
  getAgentById, 
  addAgent, 
  updateAgent, 
  removeAgentById 
} from '../../utils/agentRegistry';

// GET /api/agents - Get all agents
export async function GET() {
  try {
    const agents = getAllAgents();
    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error getting agents:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve agents' },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['id', 'name', 'description', 'icon', 'webhookUrl'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    const newAgent = addAgent(body);
    return NextResponse.json(newAgent, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create agent';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 