import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

const KR_TZ = "Asia/Seoul";

const fmtYmd = new Intl.DateTimeFormat("en-CA", {
  timeZone: KR_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const fmtTime = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KR_TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function ymdSeoul(d: Date): string {
  return fmtYmd.format(d);
}

function todayInSeoul(): { year: number; month: number; day: number } {
  const parts = fmtYmd.formatToParts(new Date());
  return {
    year: Number(parts.find((p) => p.type === "year")!.value),
    month: Number(parts.find((p) => p.type === "month")!.value),
    day: Number(parts.find((p) => p.type === "day")!.value),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

type Schedule = {
  id: number;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  location: string | null;
};

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ ym?: string }>;
}) {
  const params = await searchParams;
  const today = todayInSeoul();

  let year = today.year;
  let month = today.month;
  if (params.ym) {
    const m = params.ym.match(/^(\d{4})-(\d{1,2})$/);
    if (m) {
      year = Number(m[1]);
      month = Math.min(12, Math.max(1, Number(m[2])));
    }
  }

  const firstOfMonth = new Date(year, month - 1, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  type Cell = {
    date: Date;
    ymd: string;
    inMonth: boolean;
    isToday: boolean;
  };
  const cells: Cell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startWeekday + 1;
    const cellDate = new Date(year, month - 1, dayNum);
    cells.push({
      date: cellDate,
      ymd: ymdSeoul(cellDate),
      inMonth: dayNum >= 1 && dayNum <= daysInMonth,
      isToday:
        cellDate.getFullYear() === today.year &&
        cellDate.getMonth() + 1 === today.month &&
        cellDate.getDate() === today.day,
    });
  }

  // Query a 6-week range with 1 day buffer on each side
  const rangeStart = new Date(cells[0].date.getTime() - 86400000).toISOString();
  const rangeEnd = new Date(
    cells[cells.length - 1].date.getTime() + 2 * 86400000,
  ).toISOString();

  const supabase = await createClient();
  const { data: events } = await supabase
    .from("schedules")
    .select("id, title, description, start_at, end_at, location")
    .gte("start_at", rangeStart)
    .lt("start_at", rangeEnd)
    .order("start_at", { ascending: true });

  const eventsByDay = new Map<string, Schedule[]>();
  for (const e of (events ?? []) as Schedule[]) {
    const key = ymdSeoul(new Date(e.start_at));
    const list = eventsByDay.get(key) ?? [];
    list.push(e);
    eventsByDay.set(key, list);
  }

  const prevYm =
    month === 1 ? `${year - 1}-12` : `${year}-${pad(month - 1)}`;
  const nextYm =
    month === 12 ? `${year + 1}-01` : `${year}-${pad(month + 1)}`;
  const currentYm = `${year}-${pad(month)}`;
  const todayYm = `${today.year}-${pad(today.month)}`;

  const userData = await getCurrentUser();
  const isAdmin = userData?.profile?.role === "admin";

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">일정</h1>
          <p className="text-sm text-stone-500 mt-1">
            참나눔회의 행사와 활동 일정입니다.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/schedule/new"
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
          >
            새 일정 등록
          </Link>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
          <Link
            href={`/schedule?ym=${prevYm}`}
            className="px-3 py-1.5 rounded hover:bg-stone-100 text-sm text-stone-600"
          >
            ← 이전
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">
              {year}년 {month}월
            </h2>
            {currentYm !== todayYm && (
              <Link
                href="/schedule"
                className="text-xs px-2 py-1 border border-stone-300 rounded hover:bg-stone-100"
              >
                오늘
              </Link>
            )}
          </div>
          <Link
            href={`/schedule?ym=${nextYm}`}
            className="px-3 py-1.5 rounded hover:bg-stone-100 text-sm text-stone-600"
          >
            다음 →
          </Link>
        </div>

        <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50">
          {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
            <div
              key={d}
              className={`px-2 py-2 text-xs font-medium text-center ${
                i === 0
                  ? "text-red-600"
                  : i === 6
                    ? "text-blue-600"
                    : "text-stone-600"
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((c, i) => {
            const dayEvents = eventsByDay.get(c.ymd) ?? [];
            const dow = i % 7;
            const dayNumColor = !c.inMonth
              ? "text-stone-300"
              : c.isToday
                ? "text-emerald-700 font-bold"
                : dow === 0
                  ? "text-red-600"
                  : dow === 6
                    ? "text-blue-600"
                    : "text-stone-700";
            const isLastCol = dow === 6;
            return (
              <div
                key={c.ymd + i}
                className={`min-h-[110px] p-1.5 border-b border-stone-100 ${
                  isLastCol ? "" : "border-r"
                } ${c.inMonth ? "" : "bg-stone-50/60"} ${
                  c.isToday ? "bg-emerald-50" : ""
                }`}
              >
                <div className={`text-xs mb-1 ${dayNumColor}`}>
                  {c.date.getDate()}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <Link
                      key={e.id}
                      href={`/schedule/${e.id}`}
                      title={`${fmtTime.format(new Date(e.start_at))} ${e.title}`}
                      className="block text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 truncate leading-tight"
                    >
                      <span className="font-medium">
                        {fmtTime.format(new Date(e.start_at))}
                      </span>{" "}
                      {e.title}
                    </Link>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-stone-500 px-1.5">
                      +{dayEvents.length - 3}개 더
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-xs text-stone-500 text-center">
        일정을 클릭하면 자세한 내용을 볼 수 있습니다.
      </p>
    </div>
  );
}
