import { useCallback, useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { TechnologyAutocomplete } from './technology-autocomplete';
import InputError from '@/components/input-error';

interface Technology { id:number; name:string; slug:string; icon?:string|null; category?:string }
interface Skill { id:number; technology:Technology; level:string; years_experience:number|null; position:number; visibility:string }

interface Props { initialSkills: Skill[]; }

const LEVELS = [ 'learning','intermediate','advanced' ];
const VISIBILITIES = [ 'public','members','private' ];

export function SkillEditor({ initialSkills }: Props) {
  // Fuente de verdad: props de la página (después de cada redirect). Para evitar parpadeos mantenemos estado local sincronizado.
  const page = usePage<{ skills?: Skill[] }>();
  const serverSkills = (page.props as any).skills || initialSkills;
  const [skills, setSkills] = useState<Skill[]>(() => [...serverSkills].sort((a,b)=>a.position-b.position));
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string|undefined>();
  const dragId = useRef<number|null>(null);

  // Sincronizar cuando el servidor devuelve nueva lista.
  useEffect(() => {
    setSkills([...serverSkills].sort((a,b)=>a.position-b.position));
  }, [serverSkills.map(s=> s.id+'-'+s.position+'-'+s.level+'-'+s.visibility).join('|')]);

  const addTech = async (tech: Technology) => {
    if (skills.some(s => s.technology.id === tech.id)) return;
    setAdding(true); setError(undefined);
    router.post('/skills', { technology_id: tech.id, level: 'learning' }, {
      preserveScroll: true,
      only: ['skills'],
      onError: (errs) => { setError(Object.values(errs)[0] as string); },
      onFinish: () => setAdding(false)
    });
  };

  const updateSkill = (id:number, payload:Partial<Skill>) => {
    setError(undefined);
    router.patch(`/skills/${id}`, payload, {
      preserveScroll: true,
      only: ['skills'],
      onError: errs => setError(Object.values(errs)[0] as string)
    });
  };

  const removeSkill = (id:number) => {
    setError(undefined);
    router.delete(`/skills/${id}`, {
      preserveScroll: true,
      only: ['skills'],
      onError: errs => setError(Object.values(errs)[0] as string)
    });
  };

  const onDragStart = (id:number) => (e:React.DragEvent) => { dragId.current = id; e.dataTransfer.effectAllowed='move'; };
  const onDragOver = (id:number) => (e:React.DragEvent) => { e.preventDefault(); if(dragId.current===id) return; setSkills(prev => {
    const dragged = prev.find(s=>s.id===dragId.current)!; const others = prev.filter(s=>s.id!==dragged.id);
    const index = others.findIndex(s=>s.id===id); const newArr = [...others.slice(0,index), dragged, ...others.slice(index)];
    return newArr.map((s,i)=> ({...s, position:i+1}));
  }); };
  const onDrop = () => {
    const orderedIds = skills.slice().sort((a,b)=>a.position-b.position).map(s=>s.id);
    router.post('/skills/reorder', { skill_ids: orderedIds }, {
      preserveScroll: true,
      only: ['skills'],
      onError: errs => setError(Object.values(errs)[0] as string),
      onFinish: () => { dragId.current=null; }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TechnologyAutocomplete onSelect={addTech} disabledIds={skills.map(s=>s.technology.id)} />
        {adding && <span className="text-xs text-neutral-500">Guardando...</span>}
      </div>
      <InputError message={error || (usePage() as any)?.props?.errors?.technology_id} />
      <ul className="space-y-2">
        {skills.sort((a,b)=> a.position - b.position).map(skill => (
          <li key={skill.id}
              draggable
              onDragStart={onDragStart(skill.id)}
              onDragOver={onDragOver(skill.id)}
              onDrop={onDrop}
              className="flex items-center gap-3 rounded border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-600 dark:bg-neutral-800">
            <span className="cursor-move select-none text-neutral-400">☰</span>
            <div className="flex flex-col">
              <span className="font-medium">{skill.technology.name}</span>
              <span className="text-xs text-neutral-500">{skill.technology.category}</span>
            </div>
            <select value={skill.level} onChange={e=> updateSkill(skill.id,{level:e.target.value})}
              className="ml-auto rounded border border-neutral-300 bg-white px-1 py-0.5 text-xs dark:border-neutral-600 dark:bg-neutral-700">
              {LEVELS.map(l=> <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={skill.visibility} onChange={e=> updateSkill(skill.id,{visibility:e.target.value})}
              className="rounded border border-neutral-300 bg-white px-1 py-0.5 text-xs dark:border-neutral-600 dark:bg-neutral-700">
              {VISIBILITIES.map(v=> <option key={v} value={v}>{v}</option>)}
            </select>
            <button type="button" onClick={()=> removeSkill(skill.id)} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
