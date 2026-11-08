import React from "react";
import { ChevronLeft, ChevronRight, User } from "lucide-react";

export interface KanbanColumn {
  id: string;
  title: string;
  accentColor: string; // e.g. "border-amber-500", "border-indigo-500"
  badgeColor: string;  // e.g. "bg-amber-500/10 text-amber-400"
}

export interface KanbanItem {
  id: string;
  columnId: string;
  title: string;
  subtitle?: string;
  avatarUrl?: string | null;
  tags?: string[];
  metrics?: { label: string; value: string }[];
  actionLabel?: string;
  onActionClick?: () => void;
}

export interface TwentyKanbanBoardProps {
  columns: KanbanColumn[];
  items: KanbanItem[];
  onMoveItem: (itemId: string, targetColumnId: string) => void;
  onItemClick?: (item: KanbanItem) => void;
  emptyLabel?: string;
}

export const TwentyKanbanBoard: React.FC<TwentyKanbanBoardProps> = ({
  columns,
  items,
  onMoveItem,
  onItemClick,
  emptyLabel = "No candidates in this stage",
}) => {
  const getNextColumnId = (currentColId: string): string | null => {
    const idx = columns.findIndex((c) => c.id === currentColId);
    if (idx !== -1 && idx < columns.length - 1) {
      return columns[idx + 1].id;
    }
    return null;
  };

  const getPrevColumnId = (currentColId: string): string | null => {
    const idx = columns.findIndex((c) => c.id === currentColId);
    if (idx > 0) {
      return columns[idx - 1].id;
    }
    return null;
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 select-none pr-2">
      {columns.map((col) => {
        const columnItems = items.filter((item) => item.columnId === col.id);

        return (
          <div
            key={col.id}
            className="w-72 sm:w-80 shrink-0 bg-slate-950/60 border border-slate-800/90 rounded-2xl flex flex-col max-h-[620px] shadow-sm"
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.badgeColor.replace(/text-/, "bg-")}`} />
                <h4 className="text-xs font-bold text-white tracking-wide uppercase">{col.title}</h4>
              </div>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                {columnItems.length}
              </span>
            </div>

            {/* Column Cards List */}
            <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
              {columnItems.length === 0 ? (
                <div className="p-6 text-center text-[11px] text-slate-500 border border-dashed border-slate-800/60 rounded-xl">
                  {emptyLabel}
                </div>
              ) : (
                columnItems.map((item) => {
                  const prevCol = getPrevColumnId(item.columnId);
                  const nextCol = getNextColumnId(item.columnId);

                  return (
                    <div
                      key={item.id}
                      onClick={() => onItemClick && onItemClick(item)}
                      className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 p-3.5 rounded-xl shadow-sm transition-all duration-150 space-y-2.5 cursor-pointer"
                    >
                      {/* Top Row: Avatar & Title */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 overflow-hidden flex items-center justify-center shrink-0">
                            {item.avatarUrl ? (
                              <img src={item.avatarUrl} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white truncate">{item.title}</h5>
                            {item.subtitle && (
                              <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 font-mono"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Metrics (e.g. Salary, Experience) */}
                      {item.metrics && item.metrics.length > 0 && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/50 text-[10px]">
                          {item.metrics.map((m, mIdx) => (
                            <div key={mIdx}>
                              <span className="text-slate-500 block">{m.label}</span>
                              <span className="font-semibold text-slate-300">{m.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Card Actions & Stage Controls */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="pt-2 border-t border-slate-800/60 flex items-center justify-between"
                      >
                        {/* Quick Action Button */}
                        {item.actionLabel && item.onActionClick ? (
                          <button
                            type="button"
                            onClick={item.onActionClick}
                            className="px-2 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold transition-colors"
                          >
                            {item.actionLabel}
                          </button>
                        ) : (
                          <span />
                        )}

                        {/* Stage Mover Arrows */}
                        <div className="flex items-center gap-1">
                          {prevCol && (
                            <button
                              type="button"
                              onClick={() => onMoveItem(item.id, prevCol)}
                              title="Move back"
                              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {nextCol && (
                            <button
                              type="button"
                              onClick={() => onMoveItem(item.id, nextCol)}
                              title="Move to next stage"
                              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
