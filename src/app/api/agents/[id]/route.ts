import { NextResponse } from 'next/server';
import { 
  getAgentById, 
  updateAgent, 
  removeAgentById 
} from '../../../utils/agentRegistry';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/agents/[id] - Get a specific agent
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const agent = getAgentById(params.id);
    
    if (!agent) {
      return NextResponse.json(
        { error: `Agent with ID ${params.id} not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(agent);
  } catch (error) {
    console.error(`Error getting agent ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to retrieve agent' },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/[id] - Update an agent
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const updatedAgent = updateAgent(params.id, body);
    
    if (!updatedAgent) {
      return NextResponse.json(
        { error: `Agent with ID ${params.id} not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error(`Error updating agent ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id] - Remove an agent
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const success = removeAgentById(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: `Agent with ID ${params.id} not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: `Agent with ID ${params.id} successfully removed` },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting agent ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
} 