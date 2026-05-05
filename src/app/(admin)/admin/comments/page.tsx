import { createClient } from "@/lib/supabase/server";
import CommentActions from "@/components/admin/CommentActions";
import { formatRelative } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

async function getComments() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select("*, post:posts(title, slug)")
    .order("created_at", { ascending: false });
  return data || [];
}

export default async function CommentsPage() {
  const comments = await getComments();
  const pending = comments.filter((c) => !c.approved);
  const approved = comments.filter((c) => c.approved);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Comments</h1>
        <p className="text-sm text-gray-500">{pending.length} pending approval · {approved.length} approved</p>
      </div>

      {pending.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-signal-amber uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-signal-amber animate-pulse" />
            Pending Approval ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      )}

      {approved.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Approved ({approved.length})
          </h2>
          <div className="space-y-3">
            {approved.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      )}

      {comments.length === 0 && (
        <div className="tunnel-card p-10 text-center text-gray-500">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
          No comments yet.
        </div>
      )}
    </div>
  );
}

function CommentCard({ comment }: { comment: any }) {
  return (
    <div className={`tunnel-card p-4 ${!comment.approved ? "border-signal-amber/20" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-medium text-white">{comment.author_name}</span>
            <span className="text-xs text-gray-600">{comment.author_email}</span>
            <span className="text-xs text-gray-600">·</span>
            <span className="text-xs text-gray-600">{formatRelative(comment.created_at)}</span>
            {!comment.approved && (
              <span className="signal-badge text-xs py-0 px-2">Pending</span>
            )}
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-2">{comment.content}</p>
          {comment.post && (
            <p className="text-xs text-gray-600">
              On: <span className="text-signal-cyan">{comment.post.title}</span>
            </p>
          )}
        </div>
        <CommentActions commentId={comment.id} approved={comment.approved} />
      </div>
    </div>
  );
}
