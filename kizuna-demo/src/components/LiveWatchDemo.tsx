import { useMemo, useState } from 'react';

interface Comment {
  id: number;
  author: string;
  text: string;
  timestamp: string;
}

const seedComments: Comment[] = [
  { id: 1, author: 'Nagaoka', text: 'Shizuku’s aura is unreal in this round.', timestamp: '2 min ago' },
  { id: 2, author: 'Sato', text: 'Love the streaking lighting effect on the arena.', timestamp: '5 min ago' },
  { id: 3, author: 'Riku', text: 'Waiting for the next mint call!', timestamp: '8 min ago' },
];

export const LiveWatchDemo = () => {
  const [comments, setComments] = useState<Comment[]>(seedComments);
  const [draft, setDraft] = useState('');
  const [passcode, setPasscode] = useState('KIZUNA');
  const [mintMessage, setMintMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => draft.trim().length > 0, [draft]);

  const canMint = passcode.trim().length > 0;
  const handleMint = () => {
    if (!canMint) return;
    setMintMessage(`Passcode “${passcode.trim()}” accepted — technique minted!`);
    setPasscode('');
  };

  const submit = () => {
    if (!canSubmit) return;
    const nextComment: Comment = {
      id: comments.length + 1,
      author: 'You',
      text: draft.trim(),
      timestamp: 'just now',
    };
    setComments(prev => [nextComment, ...prev]);
    setDraft('');
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-4">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-gray-800 bg-black shadow-2xl">
          <iframe
            src="https://www.youtube.com/embed/fqjeXD0Zbt4?autoplay=0"
            title="ONE Championship Live Watch Demo"
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 opacity-0 hover:opacity-100 transition-opacity" />
          <div className="absolute right-4 top-4 w-64 rounded-2xl border border-blue-500/50 bg-black/70 p-4 shadow-2xl backdrop-blur-md">
            <p className="text-xs uppercase tracking-wider text-blue-300">Mint Window</p>
            <p className="text-sm text-gray-300">
              Enter the live mint passcode and secure a new technique for Shizuku’s locker.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <input
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Live passcode"
                className="w-full rounded-xl border border-blue-500/70 bg-black/40 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
              />
              <button
                onClick={handleMint}
                disabled={!canMint}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white disabled:opacity-50"
              >
                Mint Technique
              </button>
            </div>
            {mintMessage && (
              <p className="mt-2 text-xs text-green-300">{mintMessage}</p>
            )}
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-600/50 p-4 text-sm text-gray-200">
          <p className="font-semibold text-white mb-1">Live Watch Demo</p>
          <p className="text-gray-400">
            Video embed powered by ONE Championship’s official channel. In the full product this panel
            will surface real-time stream metadata, mint windows, and light-up badges based on your watched time.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Live Comments</h3>
          <span className="text-xs text-gray-400">{comments.length} online</span>
        </div>
        <div className="space-y-3 overflow-y-auto max-h-80">
          {comments.map(comment => (
            <div key={comment.id} className="rounded-xl border border-gray-800/70 bg-gray-950/60 p-3 text-sm">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{comment.author}</span>
                <span>{comment.timestamp}</span>
              </div>
              <p className="mt-1 text-gray-100">{comment.text}</p>
            </div>
          ))}
        </div>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Cheer, react, or drop a favorite technique…"
          className="min-h-[80px] w-full resize-none rounded-xl border border-gray-800 bg-black/50 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="self-end rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
        >
          Post comment
        </button>
      </div>
    </div>
  );
};
