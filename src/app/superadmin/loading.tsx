export default function SuperAdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 bg-slate-200 rounded-xl w-64 mb-2" />
          <div className="h-4 bg-slate-100 rounded-lg w-96" />
        </div>
        <div className="flex gap-2.5">
          <div className="h-9 w-24 bg-slate-200 rounded-xl" />
          <div className="h-9 w-28 bg-blue-200 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 h-[152px] flex flex-col justify-between">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-100" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-slate-100 rounded w-24" />
                <div className="h-7 bg-slate-200 rounded w-32" />
              </div>
            </div>
            <div className="h-3 bg-slate-100 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

