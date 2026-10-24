import Link from "next/link";

const navItems = [
  { label: "Dashboard", icon: "▣", active: true },
  { label: "My vacancies", icon: "▤" },
  { label: "Create vacancy", icon: "+" },
  { label: "Applications", icon: "▥" },
  { label: "My profile", icon: "•" },
];

const statCards = [
  { label: "Create\nvacancy", value: "" },
  { label: "My\nvacancies", value: 4 },
  { label: "Owned\naccounts", value: 2 },
  { label: "In review", value: 1 },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#dfe4ec] px-3 py-4 sm:px-6">
      <div className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[28px] border border-[#2e343d] bg-[#102238] shadow-[0_30px_60px_rgba(0,0,0,0.28)]">
        <div className="bg-[#1a1d22] px-4 pb-3 pt-2 text-white">
          <div className="flex items-center justify-between text-[12px] font-semibold tracking-[0.08em]">
            <span>6:53 PM</span>
            <div className="flex items-center gap-2 text-[10px]">
              <span>◔</span>
              <span>◔</span>
              <span>▣</span>
              <span className="ml-1">18</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-[22px] bg-[#272b30] px-3 py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4a4d52] text-base text-white">
                🏠
              </div>
              <div className="flex items-center gap-2 text-sm text-white/90">
                <span className="text-lg">◌</span>
                <span className="font-medium text-[#f4f7ff]">content://com.wh</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2b2e33] text-xl text-white">
                +
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2b2e33] text-xs font-bold text-white">
                12
              </div>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2b2e33] text-xl text-white">
                ⋮
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#0b1d2d] px-0 pb-4 text-white">
          <div className="flex items-center justify-between border-b border-[#20324a] bg-[#0d2338] px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#2f82db] text-xl font-bold text-white shadow-inner shadow-blue-200/20">
                OJB
              </div>
              <div className="text-[15px] font-black tracking-tight text-[#f2f7ff]">
                OnlineJobBoard
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a2d42] text-xl text-white/90">
                🔔
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff3b30] text-[10px] font-bold text-white">
                  2
                </span>
              </button>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#364d68] text-xl text-white/90">
                ◉
              </button>
            </div>
          </div>

          <div className="mx-4 mt-4 flex items-center gap-4 rounded-[20px] bg-[#1b2e43] px-3 py-3 shadow-inner shadow-[#223750]">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#dfeaf8] text-2xl font-bold text-[#1d2d3b]">
              AM
            </div>
            <div className="min-w-0">
              <div className="text-[28px] font-bold tracking-tight text-white">Alex Morgan</div>
              <div className="text-[18px] text-[#dfeaf8]/80">Lakeview Technologies</div>
            </div>
            <button type="button" className="ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e5ebf4] text-3xl text-[#1a2d3f]">
              ←
            </button>
          </div>

          <div className="px-4 pb-3 pt-5">
            <div className="mb-4 text-[15px] font-bold uppercase tracking-[0.14em] text-[#d9e8ff]/70">
              Employer Workspace
            </div>

            <div className="grid grid-cols-2 gap-3">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[19px] font-semibold transition",
                    item.active
                      ? "bg-[#1d334d] text-white shadow-inner shadow-[#243b59]"
                      : "text-[#edf4ff]/90 hover:bg-[#1a2d42]",
                  ].join(" ")}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative bg-[#0f2338] pb-4">
          <div className="absolute bottom-8 right-7 z-20">
            <button
              type="button"
              className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1d8ae6] text-4xl font-bold text-white shadow-[0_18px_35px_rgba(29,138,230,0.6)]"
            >
              +
            </button>
          </div>

          <div className="ml-auto mr-3 flex w-[160px] flex-col gap-3 pb-2 pt-2">
            {statCards.map((card, index) => (
              <div
                key={card.label}
                className={[
                  "rounded-[22px] border border-white/10 bg-[#edf2f8] p-3 text-[#0d1d2d] shadow-sm",
                  index === 0 ? "min-h-[120px]" : "min-h-[110px]",
                ].join(" ")}
              >
                <div className="whitespace-pre-line text-[15px] font-semibold leading-tight text-[#1b2d3e]">
                  {card.label}
                </div>
                {card.value !== "" ? (
                  <div className="mt-3 text-[42px] font-bold leading-none tracking-tight text-[#0f2338]">
                    {card.value}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}