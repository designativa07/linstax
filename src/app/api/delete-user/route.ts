import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({ 
      success: true, 
      message: 'API na raiz funcionando!',
      receivedData: body 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro na API raiz' }, { status: 500 })
  }
}
