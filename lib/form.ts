/**
 * Utilities for safe form data initialization.
 *
 * CONVENTION: Todo useState de formData que recebe prop externa
 * DEVE usar initFormData() — nunca inicializar diretamente com `prop.field`
 * sem checar undefined/null. Ver README de componentes.
 */

/**
 * Inicializa formData de forma segura a partir de uma prop.
 * Garante que nenhum campo seja undefined — sempre usa o default correspondente.
 *
 * @param source - Objeto fonte (pode ser null/undefined)
 * @param defaults - Valores padrão garantidos para todos os campos
 * @returns Objeto com todos os campos do defaults preenchidos
 *
 * @example
 * const DEFAULT_FORM = { title: '', content: '', mood: 'neutral' };
 * const [formData, setFormData] = useState(() => initFormData(post, DEFAULT_FORM));
 * useEffect(() => { setFormData(initFormData(post, DEFAULT_FORM)); }, [post?.id]);
 */
export function initFormData<T extends Record<string, unknown>>(
  source: Partial<T> | null | undefined,
  defaults: T
): T {
  if (!source) return { ...defaults };
  return (Object.keys(defaults) as (keyof T)[]).reduce(
    (acc, key) => {
      const val = source[key];
      acc[key] = val !== undefined && val !== null ? val : defaults[key];
      return acc;
    },
    {} as T
  );
}
