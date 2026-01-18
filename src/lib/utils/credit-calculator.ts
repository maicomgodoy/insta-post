/**
 * Utilitários para cálculo de créditos por operação
 * 
 * Baseado na estratégia de pricing do projeto
 */

export type CreditOperation = 
  | 'generate_image'
  | 'generate_caption'
  | 'edit_image'
  | 'edit_caption'
  | 'reuse_post'
  | 'create_post' // Geração completa (imagem + legenda)

/**
 * Calcula o custo em créditos para uma operação
 */
export function calculateCreditCost(operation: CreditOperation): number {
  const costs: Record<CreditOperation, number> = {
    generate_image: 2,
    generate_caption: 1,
    edit_image: 2,
    edit_caption: 1,
    reuse_post: 3,
    create_post: 3, // Imagem (2) + Legenda (1)
  }

  return costs[operation] || 0
}

/**
 * Calcula o custo total em créditos para múltiplas operações
 */
export function calculateTotalCreditCost(operations: CreditOperation[]): number {
  return operations.reduce((total, operation) => {
    return total + calculateCreditCost(operation)
  }, 0)
}
