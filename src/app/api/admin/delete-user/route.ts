import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    console.log('🔍 DELETE USER API - Iniciando processo')
    console.log('📝 userId recebido:', userId)
    
    if (!userId) {
      console.log('❌ Erro: userId não fornecido')
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }
    
    const supabase = createClient()
    
    // Verificar se o usuário atual é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('👤 Usuário autenticado:', user?.id, user?.email)
    
    if (authError || !user) {
      console.log('❌ Erro de autenticação:', authError)
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('users_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('🔐 Perfil do usuário atual:', profile, 'Erro:', profileError)

    if (profileError || !profile || profile.role !== 'admin') {
      console.log('❌ Usuário não é admin')
      return NextResponse.json({ error: 'Apenas administradores podem excluir usuários' }, { status: 403 })
    }

    // Permitir auto-exclusão (admin pode excluir a si mesmo se necessário)
    // Comentado: if (userId === user.id) { return NextResponse.json({ error: 'Você não pode excluir a si mesmo' }, { status: 400 }) }

    // Verificar se o usuário a ser excluído existe
    console.log('🔍 Buscando usuário alvo com ID:', userId)
    
    const { data: targetUser, error: targetError } = await supabase
      .from('users_profiles')
      .select('id, display_name')
      .eq('id', userId)
      .single()

    console.log('🎯 Usuário alvo encontrado:', targetUser)
    console.log('❌ Erro na busca:', targetError)

    if (targetError || !targetUser) {
      console.log('❌ Usuário não encontrado na tabela users_profiles')
      
      // Buscar em auth.users para debug
      const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(userId)
      console.log('🔍 Usuário em auth.users:', authUser, 'Erro:', authUserError)
      
      return NextResponse.json({ 
        error: 'Usuário não encontrado',
        debug: {
          userId,
          targetError: targetError?.message,
          authUserError: authUserError?.message
        }
      }, { status: 404 })
    }

    // Excluir o perfil do usuário (CASCADE remove dados relacionados)
    console.log('🗑️ Iniciando exclusão do usuário:', userId)
    
    const { error: deleteError } = await supabase
      .from('users_profiles')
      .delete()
      .eq('id', userId)

    if (deleteError) {
      console.error('❌ Erro ao excluir usuário:', deleteError)
      return NextResponse.json({ error: 'Erro ao excluir usuário: ' + deleteError.message }, { status: 500 })
    }
    
    console.log(`✅ Usuário ${targetUser.display_name || userId} excluído com sucesso por admin ${user.id}`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Usuário ${targetUser.display_name || userId} excluído com sucesso`,
      userId: userId
    })
    
  } catch (error) {
    console.error('💥 Erro geral na API de exclusão de usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
