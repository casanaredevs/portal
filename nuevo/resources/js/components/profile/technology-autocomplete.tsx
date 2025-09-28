import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface TechnologyOption {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  category?: string;
}

interface Props {
  onSelect: (tech: TechnologyOption) => void;
  placeholder?: string;
  disabledIds?: number[];
}

export function TechnologyAutocomplete({ onSelect, placeholder='Buscar tecnología...', disabledIds=[] }: Props) {
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<TechnologyOption[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!term) { setOptions([]); return; }
    let abort = false;
    setLoading(true);
    const id = setTimeout(() => {
      apiFetch<{data: TechnologyOption[]}>(`/technologies/search?q=${encodeURIComponent(term)}`)
        .then(r => { if(!abort){ setOptions(r.data);} })
        .catch(()=>{ if(!abort){ setOptions([]);} })
        .finally(()=>{ if(!abort){ setLoading(false); setOpen(true);} });
    }, 250);
    return () => { abort = true; clearTimeout(id); };
  }, [term]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if(!containerRef.current || containerRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <input
        className="w-full rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
        placeholder={placeholder}
        value={term}
        onChange={e=> setTerm(e.target.value)}
        onFocus={()=> term && setOpen(true)}
      />
      {open && (options.length > 0 || loading) && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border border-neutral-300 bg-white shadow dark:border-neutral-600 dark:bg-neutral-800">
          {loading && <div className="px-3 py-2 text-xs text-neutral-500">Buscando...</div>}
          {!loading && options.filter(o=> !disabledIds.includes(o.id)).map(o => (
            <button
              key={o.id}
              type="button"
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              onClick={()=> { onSelect(o); setTerm(''); setOptions([]); setOpen(false);} }
            >
              {o.icon && <span className="text-xs opacity-70">{o.icon}</span>}
              <span>{o.name}</span>
              <span className="ml-auto text-[10px] uppercase tracking-wide text-neutral-400">{o.category}</span>
            </button>
          ))}
          {!loading && options.filter(o=> !disabledIds.includes(o.id)).length === 0 && (
            <div className="px-3 py-2 text-xs text-neutral-500">Sin resultados</div>
          )}
        </div>
      )}
    </div>
  );
}

