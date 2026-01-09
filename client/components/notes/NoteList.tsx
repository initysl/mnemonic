import NotesStats from './NotesStats';
import NoteCard from './NoteCard';

export default function NotesList() {
  return (
    <div className='h-full rounded-2xl bg-white p-4 overflow-y-auto'>
      <NotesStats />

      <div className='mt-4 space-y-3'>
        <NoteCard />
        <NoteCard />
        <NoteCard />
      </div>
    </div>
  );
}
